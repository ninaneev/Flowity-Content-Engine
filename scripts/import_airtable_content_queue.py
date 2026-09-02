#!/usr/bin/env python3
"""Import Airtable "Content Queue" records into the Content Engine posts table.

Purpose
-------
Nina's content queue is being consolidated into the engine DB (SQLite
backend/flowity.db locally, same schema on Supabase). This script takes a
LOCAL JSON export of the Airtable Content Queue table (base appKUvWnLGQiQ3IwM,
table tblNNTtT6rCshz6Jz) and inserts each record into `posts`.
It never talks to the Airtable API.

Input JSON format
-----------------
Either of these two shapes is accepted:

1. Raw Airtable API list response:
   {
     "records": [
       {
         "id": "recXXXXXXXXXXXXXX",
         "fields": {
           "Hook": "Your churn didn't start last month.",
           "Channel": "LinkedIn",
           "Angle": "customer-signals",
           "Body": "Full post body...",
           "Status": "Ready to post",
           "Post Date": "2026-07-09",
           "Engagement Note": "optional",
           "Conversations Started": 0
         }
       }
     ]
   }

2. A plain list of field dicts (same keys as "fields" above):
   [ {"Hook": "...", "Channel": "LinkedIn", ...}, ... ]

Only "Hook" is required per record; everything else is optional.

Field mapping (Airtable -> posts)
---------------------------------
  Hook                  -> hook
  Body                  -> body
  Channel               -> channel  (LinkedIn->linkedin, X/Twitter->x,
                                     Newsletter/Beehiiv->newsletter;
                                     default: linkedin)
  Angle                 -> objective (also echoed in notes as pillar tag)
  Status                -> status   (see STATUS_MAP; "Ready to post" becomes
                                     "scheduled" when a Post Date exists,
                                     otherwise "revised" — post is final copy
                                     but has no slot yet)
  Post Date             -> scheduled_at (date-only values get 09:00:00)
  Engagement Note,
  Conversations Started -> appended to notes
  (provenance)          -> notes always include marker
                           "airtable-import:content-queue" plus the Airtable
                           record id when present

Posts status flow in this schema:
  idea -> draft -> revised -> scheduled -> publishing -> published | failed

Idempotency
-----------
A record is SKIPPED if a row with the same hook (exact match, after
whitespace trim) already exists in posts. Safe to re-run.

Usage
-----
  python scripts/import_airtable_content_queue.py path/to/export.json \
      [--db backend/flowity.db] [--dry-run]
"""

import argparse
import json
import sqlite3
import sys
from pathlib import Path

MARKER = "airtable-import:content-queue"

CHANNEL_MAP = {
    "linkedin": "linkedin",
    "x": "x",
    "twitter": "x",
    "x/twitter": "x",
    "newsletter": "newsletter",
    "beehiiv": "newsletter",
    "call it!": "newsletter",
}

# Airtable Status -> posts.status. "Ready to post" is resolved dynamically:
# scheduled if a Post Date exists, else revised.
STATUS_MAP = {
    "idea": "idea",
    "draft": "draft",
    "in review": "draft",
    "revised": "revised",
    "ready to post": None,  # dynamic — see map_status()
    "scheduled": "scheduled",
    "posted": "published",
    "published": "published",
}

VALID_STATUSES = {
    "idea", "draft", "revised", "scheduled", "publishing", "published", "failed",
}


def map_channel(raw):
    if not raw:
        return "linkedin"
    return CHANNEL_MAP.get(str(raw).strip().lower(), "linkedin")


def map_status(raw, post_date):
    key = str(raw or "").strip().lower()
    mapped = STATUS_MAP.get(key, "revised" if key not in VALID_STATUSES else key)
    if key == "ready to post":
        mapped = "scheduled" if post_date else "revised"
    if mapped not in VALID_STATUSES:
        mapped = "revised"
    return mapped


def map_scheduled_at(post_date):
    if not post_date:
        return None
    value = str(post_date).strip()
    if len(value) == 10:  # date only, e.g. 2026-07-09
        value += " 09:00:00"
    return value.replace("T", " ").split(".")[0].replace("Z", "").strip()


def normalize_records(payload):
    """Accept raw Airtable API shape or a plain list of field dicts."""
    if isinstance(payload, dict) and "records" in payload:
        out = []
        for rec in payload["records"]:
            fields = dict(rec.get("fields", {}))
            fields["_airtable_id"] = rec.get("id")
            out.append(fields)
        return out
    if isinstance(payload, list):
        return [dict(r) for r in payload]
    raise ValueError("Unrecognized JSON shape: expected {'records': [...]} or a list")


def build_row(fields):
    hook = (fields.get("Hook") or "").strip()
    if not hook:
        return None
    post_date = fields.get("Post Date")
    scheduled_at = map_scheduled_at(post_date)
    status = map_status(fields.get("Status"), post_date)
    angle = (fields.get("Angle") or "").strip() or None

    notes_parts = [MARKER]
    if fields.get("_airtable_id"):
        notes_parts.append(f"airtable_id:{fields['_airtable_id']}")
    if angle:
        notes_parts.append(f"pillar:{angle}")
    if fields.get("Engagement Note"):
        notes_parts.append(f"engagement_note:{str(fields['Engagement Note']).strip()}")
    if fields.get("Conversations Started") not in (None, "", 0):
        notes_parts.append(f"conversations_started:{fields['Conversations Started']}")

    return {
        "hook": hook,
        "body": (fields.get("Body") or "").strip() or None,
        "channel": map_channel(fields.get("Channel")),
        "objective": angle,
        "status": status,
        "scheduled_at": scheduled_at,
        "generation_mode": "manual",
        "notes": " | ".join(notes_parts),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("json_file", help="Path to local JSON export of the Airtable Content Queue")
    parser.add_argument("--db", default="backend/flowity.db", help="SQLite DB path (default: backend/flowity.db)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be inserted without writing")
    args = parser.parse_args()

    json_path = Path(args.json_file)
    db_path = Path(args.db)
    if not json_path.exists():
        sys.exit(f"JSON file not found: {json_path}")
    if not db_path.exists():
        sys.exit(f"Database not found: {db_path}")

    records = normalize_records(json.loads(json_path.read_text(encoding="utf-8")))

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    inserted, skipped, invalid = 0, 0, 0

    for fields in records:
        row = build_row(fields)
        if row is None:
            invalid += 1
            print("SKIP (no Hook):", json.dumps(fields)[:80])
            continue
        exists = cur.execute(
            "SELECT id FROM posts WHERE TRIM(hook) = ?", (row["hook"],)
        ).fetchone()
        if exists:
            skipped += 1
            print(f"SKIP (exists as post id={exists[0]}): {row['hook'][:60]}")
            continue
        if args.dry_run:
            inserted += 1
            print(f"WOULD INSERT [{row['status']}/{row['channel']}] {row['hook'][:60]}")
            continue
        cur.execute(
            """INSERT INTO posts
               (hook, body, channel, objective, status, scheduled_at,
                generation_mode, notes)
               VALUES (:hook, :body, :channel, :objective, :status,
                       :scheduled_at, :generation_mode, :notes)""",
            row,
        )
        inserted += 1
        print(f"INSERTED [{row['status']}/{row['channel']}] {row['hook'][:60]}")

    if not args.dry_run:
        conn.commit()
    conn.close()

    label = "would insert" if args.dry_run else "inserted"
    print(f"\nDone: {inserted} {label}, {skipped} skipped (duplicate hook), {invalid} invalid.")


if __name__ == "__main__":
    main()
