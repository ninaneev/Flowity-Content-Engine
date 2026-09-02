<!-- TITLE: [PI2][T16][Docs] Medir o ganho de tempo por publicação -->
<!-- LABELS: area:project,type:docs,prio:p1,sprint:pi2 -->

## Tarefa 16 do PI 2 — Medir o ganho de tempo

| Campo | Valor |
|-------|-------|
| **Integrante** | Andrea Nina Maciel Cressoni |
| **Branch** | `feat/pi2-t16-medicao-tempo` |
| **Área** | Projeto |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 4–5 horas |
| **Depende de** | nada (a coleta acontece nas quinzenas 4 a 6) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 16**.

Resumo: registrar a linha de base do processo manual, acrescentar os campos `external_minutes`, `tools_used` e `workflow` ao modelo Post, expor esses campos no formulário, criar `GET /reports/performance` e coletar 10 publicações por fluxo num CSV versionado. A seção de limitações precisa ser honesta.

Arquivos que você vai mexer:
- `PI2/medicao-desempenho.md` - CRIAR, protocolo, linha de base, resultados e limitações
- `PI2/dados/tempos-producao.csv` - CRIAR, dados brutos coletados
- `backend/app/models/post.py` e `backend/app/schemas/post.py` - EDITAR, os três campos novos
- `backend/app/routes/reports.py` - CRIAR, `GET /reports/performance`
- `frontend/src/components/posts/PostModal.jsx` - EDITAR, campos de tempo e fluxo

### Como medir se deu certo
- `GET /reports/performance` devolve o tempo médio por fluxo no Swagger
- O CSV tem 10 linhas por fluxo, com as colunas combinadas
- A seção de limitações cita amostra pequena, empresa única e tempo autodeclarado

### Definition of Done ✅
- [ ] `PI2/medicao-desempenho.md` criado com linha de base, protocolo, resultados e limitações
- [ ] Campos `external_minutes`, `tools_used` e `workflow` no modelo e no schema de Post
- [ ] Os três campos aparecem e salvam pelo `PostModal.jsx`
- [ ] `GET /reports/performance` devolve o tempo médio por fluxo, testado pelo Swagger
- [ ] `PI2/dados/tempos-producao.csv` versionado com 10 publicações por fluxo
- [ ] PR aberto com `Closes #94` na descrição
