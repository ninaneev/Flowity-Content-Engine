# Arquitetura do Sistema — Flowity Content Engine

## Visão geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUÁRIO (Admin)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ http://localhost:5173
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                      │
│  Dashboard │ Library │ Generator │ Pipeline │ Settings          │
│  Porta: 5173                                                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP REST (axios)
                           │ http://localhost:8000
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                            │
│                                                                 │
│  /auth        /sources      /posts                             │
│  /generation  /automation                                       │
│  Porta: 8000                                                    │
│                                                                 │
│  ┌────────────┐    ┌──────────────┐    ┌────────────────────┐  │
│  │ Repositories│   │   Services   │    │    Routes          │  │
│  │ (CRUD SQL) │    │  generator   │    │  (FastAPI Router)  │  │
│  └─────┬──────┘    └──────┬───────┘    └────────────────────┘  │
└────────┼──────────────────┼────────────────────────────────────┘
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌──────────────────┐
│    SUPABASE     │  │     OLLAMA       │
│  (PostgreSQL)   │  │  llama3.1:8b     │
│  Porta: 5432    │  │  Porta: 11434    │
└─────────────────┘  └──────────────────┘

                   ┌──────────────────┐
                   │       n8n        │
                   │  Automação       │
                   │  Porta: 5678     │
                   │                  │
                   │ Cron: todo       │
                   │ 5 minutos        │
                   │  ↓               │
                   │ GET /automation/ │
                   │ posts/ready      │
                   │  ↓               │
                   │ POST /publish-   │
                   │ attempt + result │
                   └──────────────────┘
```

## Fluxo de geração de conteúdo

```
Usuário escolhe 1-3 sources
        ↓
GeneratorPage → POST /generation/preview
        ↓
generator.py verifica modo:
  ├── "template" → _build_template_output() (sempre funciona)
  └── "ollama"   → ollama_client.generate()
                      ↓ falha?
                      └── fallback para template
        ↓
GenerationRun salvo no banco (nunca descartado)
        ↓
Resultado exibido no frontend
        ↓
Usuário clica "Salvar como rascunho"
        ↓
POST /generation/create-post
        ↓
Post criado com status "draft"
        ↓
Aparece no Pipeline e no Calendário
```

## Fluxo de publicação automática (n8n)

```
n8n Cron (a cada 5 min)
        ↓
GET /automation/posts/ready
  → retorna posts com status="scheduled" e scheduled_at <= agora
        ↓
Para cada post:
  POST /automation/posts/{id}/publish-attempt
    → muda status para "publishing"
        ↓
  n8n tenta publicar no LinkedIn/X
  (MVP: simula com delay de 2s)
        ↓
  POST /automation/posts/{id}/publish-result
    → { success: true } → status = "published"
    → { success: false } → status = "failed"
```

## Modelo de dados (ER simplificado)

```
sources ──────────────── post_sources ──────────────── posts
  id                         id                          id
  title                      post_id ──────────────────► id
  source_type                source_id ◄────────────────  hook
  content                                                  body
  theme                                                    status
  origin                                                   scheduled_at
  tags_json               generation_runs
  notes                       id
                              post_id ──────────────────► id
                              mode (template/ollama)
                              prompt_used
                              raw_output
                              parsed_hook/body/cta
```

## Segurança

- **Autenticação:** JWT (24h) para o admin
- **Automação:** Header `X-Webhook-Secret` obrigatório nas chamadas do n8n
- **CORS:** Apenas `localhost:5173` e `localhost:3000` permitidos
- **Banco:** Credenciais nunca no código, sempre via `.env`
- **Secrets:** `.env` está no `.gitignore` — nunca commitado
