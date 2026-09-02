# Content Runway — 2026-07-07

Runway check against the 2-month daily-posting goal (Jul 8 – Sep 8, 2026),
plus consolidation of the Airtable Content Queue into the engine DB.

## 1. Current inventory

### Engine DB (backend/flowity.db, `posts` table)

10 rows, all status `revised`:

| Channel    | Count |
|------------|-------|
| linkedin   | 8     |
| newsletter | 2     |

Detail: post ids 1–9 carry stale June `scheduled_at` dates (2026-06-16 through
2026-06-27); id 10 (newsletter) is undated. None are `published`. The copy is
final (revised batch of 2026-07-06) but every date needs reassigning into the
new window before scheduling.

### Airtable Content Queue (base appKUvWnLGQiQ3IwM, table tblNNTtT6rCshz6Jz)

5 records at "Ready to post" — to be migrated into the engine DB via
`scripts/import_airtable_content_queue.py` (local JSON export, idempotent,
"Ready to post" maps to `scheduled` when a Post Date exists, else `revised`).
Assumed LinkedIn daily posts.

### Total on hand

| Type                    | Count |
|-------------------------|-------|
| Daily posts (LinkedIn)  | 13 (8 engine + 5 Airtable) |
| Newsletter anchors      | 2     |
| **Total pieces**        | **15** |

## 2. Two-month target math

Cadence per docs/CALL_IT_DECISIONS.md: weekly batch = 1 teaching anchor
(newsletter + anchor LinkedIn post, same day) + 5–6 daily spins; daily posts
scheduled, never live; 4 rotating pillars (one per week):

1. Customer signals
2. Self-signals
3. AI leverage for solo founders
4. Women building differently

Window Jul 8 (Wed) – Sep 8 (Tue) = exactly 9 weeks:

| Item                          | Count |
|-------------------------------|-------|
| Weekdays (daily posts)        | 45    |
| Sundays (weekly newsletters)  | 9     |
| **Total pieces needed**       | **54** |

## 3. The gap

| Type        | Need | Have | Gap  |
|-------------|------|------|------|
| Daily posts | 45   | 13   | 32   |
| Newsletters | 9    | 2    | 7    |
| **Total**   | **54** | **15** | **39** |

Runway at 5 posts/week + 1 newsletter/week: existing inventory covers roughly
the first 2.5 weeks of dailies and the first 2 newsletters — i.e. Nina runs
dry around the week of Jul 27 without new batches.

## 4. Week-by-week batch plan

One batching session = one CALL_IT_DECISIONS weekly batch (1 anchor + 5 spins
= 6 pieces). Existing inventory covers weeks 1–2 (13 dailies vs 10 needed —
3 spill into week 3 — and both newsletters); pillar labels for weeks 1–2
follow whatever the existing revised batches already are (mixed: customer
signals / self-signals / AI leverage). Fresh rotation restarts at week 3.

| Week | Dates (Mon–Sun)       | Pillar                          | Source                               | New session? |
|------|-----------------------|---------------------------------|--------------------------------------|--------------|
| 1    | Jul 8–12 (short week) | existing batch A (mixed)        | Engine posts 1–4 + Airtable          | No           |
| 2    | Jul 13–19             | existing batch B (mixed)        | Engine posts 5–9 + newsletter id 10  | No           |
| 3    | Jul 20–26             | Customer signals                | New batch (3 leftover dailies help)  | Session 1    |
| 4    | Jul 27–Aug 2          | Self-signals                    | New batch                            | Session 2    |
| 5    | Aug 3–9               | AI leverage for solo founders   | New batch                            | Session 3    |
| 6    | Aug 10–16             | Women building differently      | New batch                            | Session 4    |
| 7    | Aug 17–23             | Customer signals                | New batch                            | Session 5    |
| 8    | Aug 24–30             | Self-signals                    | New batch                            | Session 6    |
| 9    | Aug 31–Sep 8 (long)   | AI leverage for solo founders   | New batch (+1–2 extra dailies for Sep 7–8) | Session 7    |

**Batching sessions needed: 7** (weeks 3–9), producing 7 × 6 = 42 pieces
against the 39-piece gap — small buffer absorbs the short week 1 and the
long week 9.

## 5. Immediate actions

1. Export the 5 Airtable records to JSON, run
   `python scripts/import_airtable_content_queue.py export.json --dry-run`,
   then run for real; retire the Airtable table as source of truth.
2. Re-date engine posts 1–9 from June slots into Jul 8–19 weekday slots and
   flip to `scheduled`; date newsletter id 10 for Sun Jul 12 or Jul 19.
3. Book batching session 1 (Customer signals) before Jul 17 so week 3 is
   scheduled ahead of time, per the "scheduled, never live" rule.
