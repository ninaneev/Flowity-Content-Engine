<!-- TITLE: [PI2][T15][Testes] Configurar pytest e Vitest com os primeiros testes -->
<!-- LABELS: area:testing,prio:p0,sprint:pi2 -->

## Tarefa 15 do PI 2 — Testes automatizados do projeto

| Campo | Valor |
|-------|-------|
| **Integrante** | Diego Gustavo Franco |
| **Branch** | `feat/pi2-t15-testes` |
| **Área** | Testes |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–5 horas |
| **Depende de** | Tarefa 5 (#80) e Tarefa 6 (#83) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 15**.

Resumo: instalar o pytest com `conftest.py` e SQLite em memória e escrever quatro testes de backend (upload aceita png, rejeita tipo inválido, alt vazio devolve 422, agendar post com imagem sem alt devolve 422). Instalar o Vitest com Testing Library e escrever dois testes de frontend (botão Salvar desabilitado sem alt text e um teste axe com zero violações). Sem metas de cobertura.

Arquivos que você vai mexer:
- `backend/tests/conftest.py` e `backend/tests/test_assets.py` - CRIAR
- `frontend/package.json`, `frontend/vitest.config.js`, `frontend/src/test/setup.js` - CRIAR ou EDITAR
- `frontend/src/components/posts/PostModal.test.jsx` - CRIAR, os dois testes de frontend
- `.github/workflows/tests.yml` - CRIAR, roda as duas suítes no pull request

### Como medir se deu certo
- `cd backend && pytest -q` passa com 4 testes
- `cd frontend && npm test` passa com 2 testes
- O workflow do GitHub Actions fica verde no PR desta issue

### Definition of Done ✅
- [ ] `backend/tests/conftest.py` sobe o app com SQLite em memória
- [ ] Os 4 testes de backend passam com `pytest -q`
- [ ] Os 2 testes de frontend passam com `npm test`
- [ ] O teste do axe termina com zero violações
- [ ] `.github/workflows/tests.yml` roda as duas suítes e fica verde no PR desta issue
- [ ] PR aberto com `Closes #96` na descrição
