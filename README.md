# Flowity Content Engine

Plataforma interna da **Flowity AI** para organizar referências, gerar posts com IA, planejar o calendário editorial e publicar automaticamente no LinkedIn e X.

> Projeto Integrador — Univesp · Turma 2025

---

## O que é

- 📅 **Calendário editorial** mensal com cards de posts
- 📚 **Library** de referências (sources) de conteúdo
- ✨ **Generator** de posts com IA (Ollama local + template fallback)
- 🗂️ **Pipeline** Kanban por status do conteúdo
- 🤖 **Automação** via n8n para publicação automática

## Stack

| Camada      | Tecnologia                    |
|-------------|-------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS |
| Backend     | FastAPI + SQLAlchemy           |
| Banco       | Supabase (PostgreSQL)          |
| IA Local    | Ollama (`llama3.1:8b`)         |
| Automação   | n8n                            |
| Infra       | Docker Compose                 |

## Como rodar localmente

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [Git](https://git-scm.com/)

### 1. Clone o repositório
```bash
git clone https://github.com/ninaneev/PI-Univesp.git
cd PI-Univesp
```

### 2. Configure o ambiente
```bash
cp .env.example .env
```
Abra o `.env` e preencha:
- `DATABASE_URL` → URL do Supabase (veja `PI1/supabase-setup.md`)
- `JWT_SECRET` → string aleatória (gere com `python -c "import secrets; print(secrets.token_hex(32))"`)
- `ADMIN_PASSWORD_HASH` → hash bcrypt da sua senha

### 3. Suba tudo com Docker
```bash
docker compose up --build
```

### 4. Baixe o modelo de IA
```bash
docker exec -it flowity-ollama ollama pull llama3.1:8b
```

### 5. Acesse
| Serviço     | URL                           |
|-------------|-------------------------------|
| Frontend    | http://localhost:5173          |
| Backend API | http://localhost:8000/docs     |
| n8n         | http://localhost:5678          |

## Estrutura do projeto

```
PI-Univesp/
├── frontend/          # React + Vite
│   └── src/
│       ├── pages/     # Telas da aplicação
│       └── components/# Componentes reutilizáveis
├── backend/           # FastAPI
│   └── app/
│       ├── routes/    # Endpoints da API
│       ├── models/    # ORM (SQLAlchemy)
│       └── services/  # Lógica de geração (Ollama)
├── infra/n8n/         # Workflow de automação
├── docs/              # Documentação e SQL
├── docker-compose.yml
└── .env.example
```

## Documentação

- [`PI1/supabase-setup.md`](PI1/supabase-setup.md) — SQL e configuração do banco
- [`PI1/team-tasks.md`](PI1/team-tasks.md) — Tarefas dos integrantes
- [`PI1/shadow-working-guide.md`](PI1/shadow-working-guide.md) — Guia de onboarding técnico
- [`PI1/architecture.md`](PI1/architecture.md) — Arquitetura do sistema
- [`PI1/funcionamento-plataforma.md`](PI1/funcionamento-plataforma.md) — Fluxo completo com screenshots numerados

## Fluxo de trabalho do time

1. Cada tarefa é uma **Issue** no GitHub Projects
2. Cada integrante cria uma **branch** para sua tarefa: `feat/issue-N-nome-da-tarefa`
3. Toda alteração vai por **Pull Request**
4. O PR precisa de **aprovação do líder** antes de ser mergeado na `main`

Veja [`PI1/shadow-working-guide.md`](PI1/shadow-working-guide.md) para o passo a passo completo.

---

**Flowity AI** · Automação e inteligência artificial para negócios
