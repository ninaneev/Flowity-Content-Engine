# Flowity Content Engine — Contexto para Claude

## O que é este projeto

Plataforma interna da **Flowity AI** para:
- Salvar referências de conteúdo (sources)
- Gerar posts com IA (Ollama local + template fallback)
- Gerenciar calendário editorial mensal
- Agendar e publicar automaticamente no LinkedIn e X via n8n

Projeto Integrador Univesp 2025. GitHub: `ninaneev/PI-Univesp`.

---

## Brand Colors

```
logoPurple: #9C83F7   ← cor primária (botões, links ativos, destaques)
logoCyan:   #1CD8DE   ← cor secundária (ícones, badges, CTAs)
bg-base:    #07080F   ← fundo principal
bg-surface: #0E1018   ← cards, modais
```

---

## Stack completa

| Camada | Tecnologia | Porta |
|--------|-----------|-------|
| Frontend | React 18 + Vite + Tailwind CSS | 5173 |
| Backend | FastAPI + SQLAlchemy + Pydantic | 8000 |
| Banco | Supabase (PostgreSQL) ou SQLite local | — |
| IA | Ollama `llama3.1:8b` | 11434 |
| Automação | n8n | 5678 |
| Infra | Docker Compose | — |

---

## Estrutura de pastas

```
PI-Univesp/
├── frontend/src/
│   ├── pages/                  # Telas principais
│   │   ├── DashboardPage.jsx   # Calendário mensal (IMPLEMENTADO)
│   │   ├── SourcesPage.jsx     # Library (STUB — Integrante 1)
│   │   ├── GeneratorPage.jsx   # Generator (IMPLEMENTADO)
│   │   ├── PipelinePage.jsx    # Pipeline Kanban (IMPLEMENTADO)
│   │   ├── SettingsPage.jsx    # Settings (IMPLEMENTADO)
│   │   └── LoginPage.jsx       # Login (IMPLEMENTADO)
│   ├── components/
│   │   ├── layout/             # AppShell, TopNav
│   │   ├── calendar/           # STUB — Integrante 3
│   │   ├── posts/              # STUB — Integrante 4
│   │   ├── sources/            # STUB — Integrantes 1 e 2
│   │   ├── generator/          # GeneratorPanel, SourcePicker (IMPLEMENTADOS)
│   │   └── shared/             # EmptyState, StatusBadge
│   ├── lib/api.js              # Cliente HTTP (axios)
│   └── styles/theme.css        # CSS global + classes utilitárias
│
├── backend/app/
│   ├── main.py                 # FastAPI app + CORS + rotas
│   ├── core/
│   │   ├── config.py           # Configurações (.env via pydantic-settings)
│   │   └── security.py         # JWT + autenticação admin
│   ├── db/database.py          # SQLAlchemy engine + sessão
│   ├── models/                 # ORM: source.py, post.py, generation.py
│   ├── schemas/                # Pydantic: source.py, post.py, generation.py
│   ├── routes/
│   │   ├── auth.py             # POST /auth/login (IMPLEMENTADO)
│   │   ├── sources.py          # STUB — Integrante 5
│   │   ├── posts.py            # STUB — Integrante 6
│   │   ├── generation.py       # POST /generation/* (IMPLEMENTADO)
│   │   └── automation.py       # n8n webhooks (IMPLEMENTADO)
│   ├── services/
│   │   ├── generator.py        # Template fallback + Ollama
│   │   └── ollama_client.py    # HTTP client para Ollama
│   └── repositories/
│       ├── sources.py          # CRUD sources (IMPLEMENTADO — usado por T5)
│       └── posts.py            # CRUD posts (IMPLEMENTADO — usado por T6)
│
├── infra/n8n/
│   └── flowity-publishing.json # Workflow n8n (importar no painel)
│
├── docs/
│   ├── supabase-setup.md       # SQL + instruções do banco
│   ├── architecture.md         # Diagrama do sistema
│   ├── team-tasks.md           # Tarefas dos 7 integrantes
│   └── shadow-working-guide.md # Guia issue→branch→PR
│
├── docker-compose.yml
├── .env.example
└── CLAUDE.md                   # Este arquivo
```

---

## Modelo de dados

```sql
sources          -- referências de conteúdo
  id, title, source_type, content, theme, audience, origin, tags_json, notes

posts            -- posts do calendário
  id, hook, body, cta, short_x, alt_title, channel, tone, status,
  scheduled_at, published_at, generation_mode, notes

post_sources     -- relação posts ↔ sources
  id, post_id, source_id

generation_runs  -- histórico de cada geração (nunca descartar)
  id, post_id, prompt_used, model_used, mode, raw_output,
  parsed_hook, parsed_body, parsed_cta, parsed_short_x, token_estimate, status
```

**Status dos posts:** `idea → draft → revised → scheduled → publishing → published | failed`

---

## API — endpoints principais

```
POST /auth/login                         → JWT token
GET  /sources/                           → listar sources (STUB T5)
POST /sources/                           → criar source (STUB T5)
GET  /posts/                             → listar posts (STUB T6)
POST /posts/                             → criar post (STUB T6)
GET  /posts/calendar?month=YYYY-MM       → posts do mês (STUB T6)
POST /generation/preview                 → gerar sem salvar
POST /generation/create-post             → gerar + salvar como draft
GET  /automation/posts/ready             → n8n: posts prontos
POST /automation/posts/{id}/publish-attempt → n8n: tentando publicar
POST /automation/posts/{id}/publish-result  → n8n: resultado da publicação
GET  /health                             → health check
```

Swagger UI em `http://localhost:8000/docs`

---

## Autenticação

- JWT simples, token válido por 24h
- Admin único via `.env` (`ADMIN_USERNAME` + `ADMIN_PASSWORD_HASH`)
- Todas as rotas protegidas com `Depends(get_current_admin)` exceto `/health` e `/auth/login`
- n8n usa header `X-Webhook-Secret` separado

---

## Padrões de código

### Frontend
- Classes Tailwind via tokens do `tailwind.config.js` (ex: `bg-bg-surface`, `text-flowity-purple`)
- Classes utilitárias no `theme.css`: `.card`, `.btn-primary`, `.btn-secondary`, `.input`, `.label`
- Não usar `"use client"` — este é Vite React, não Next.js
- Importar API pelo `src/lib/api.js` (nunca fetch direto)

### Backend
- Repositórios (`repositories/`) fazem queries SQLAlchemy — rotas chamam repositórios
- Schemas Pydantic com `model_config = {"from_attributes": True}` para serializar ORM
- Serviços (`services/`) contêm lógica de negócio (Ollama, template)
- `get_db()` como dependência em todas as rotas que acessam banco

---

## O que os integrantes ainda precisam implementar

| # | Integrante | Arquivos | Status |
|---|-----------|---------|--------|
| 1 | Integrante 1 | `SourcesPage.jsx`, `SourceCard.jsx` | STUB |
| 2 | Integrante 2 | `NewSourceForm.jsx` | STUB parcial |
| 3 | Integrante 3 | `ContentCalendar.jsx`, `CalendarDayCell.jsx`, `PostEventCard.jsx` | STUB |
| 4 | Integrante 4 | `PostModal.jsx` (campos faltam) | STUB parcial |
| 5 | Integrante 5 | `routes/sources.py` | STUB com TODO |
| 6 | Integrante 6 | `routes/posts.py` | STUB com TODO |
| 7 | Integrante 7 | `StatusBadge.jsx`, `SourceFilters.jsx`, polimento geral | STUB |

---

## Como rodar

```bash
# 1. Configure o ambiente
cp .env.example .env
# Preencha DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD_HASH

# 2. Suba o Docker
docker compose up --build

# 3. Baixe o modelo Ollama
docker exec -it flowity-ollama ollama pull llama3.1:8b

# 4. Acesse
# Frontend: http://localhost:5173
# Backend docs: http://localhost:8000/docs
# n8n: http://localhost:5678
```

---

## Contexto do projeto

- Repositório: `ninaneev/PI-Univesp` (público)
- Branch principal: `main` (protegida — requer PR aprovado)
- Branch de trabalho atual: `feat/flowity-content-engine`
- Framework de trabalho: Scrum simplificado
- Kanban: GitHub Projects (Issues → branches → PRs → main)

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
