# Content Engine state restore note — 2026-06-02

Purpose: document the durable state after enabling container auto-restart.

Persistence setup:
- `docker-compose.yml` now sets `restart: unless-stopped` for frontend, backend, ollama, and n8n.
- n8n already uses the persistent Docker volume `n8n_data`.
- Ollama already uses the persistent Docker volume `ollama_data`.
- The backend is using the Supabase/Postgres database configured by `.env`, not the local SQLite fallback.

Current verified pipeline count:
- 6 total posts
- 3 Idea
- 0 Draft
- 0 Revised
- 0 Scheduled
- 3 Published

Current verified Call It! / customer-signals records:
1. id=15 — Published — Newsletter — Newsletter: Your customers are usually clearer than your dashboard.
2. id=20 — Published — LinkedIn — Your customers are already writing part of your strategy. The problem is that the notes are scattered.
3. id=16 — Idea — LinkedIn — If your customer says “we need to think about it,” the signal is rarely the sentence.
4. id=17 — Idea — LinkedIn — The most expensive customer feedback is the feedback everyone already heard but nobody connected.
5. id=18 — Idea — LinkedIn — A customer going quiet is not nothing. It is a signal with bad PR.
6. id=19 — Published — LinkedIn — Your weekly leadership meeting should not start with “what did everyone notice?”

Important distinction:
- Pipeline should show all 6 posts grouped by status.
- Calendar only shows posts with `status = scheduled` and `scheduled_at` present.

If containers are stopped after Windows/Docker restart, run:

```bash
cd /mnt/c/Users/Usuario/Documents/PI-Univesp
"/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe" compose up -d
```
