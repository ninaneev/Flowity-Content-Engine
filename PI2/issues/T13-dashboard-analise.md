<!-- TITLE: [PI2][T13][Frontend] Painel de análise: engajamento por dia e LinkedIn x X -->
<!-- LABELS: area:frontend,prio:p1,pi2:dados,sprint:pi2 -->

## Tarefa 13 do PI 2 — Painel de análise das publicações

| Campo | Valor |
|-------|-------|
| **Integrante** | João Maike Silva de Jesus |
| **Branch** | `feat/pi2-t13-dashboard-analise` |
| **Área** | Frontend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 5–6 horas |
| **Depende de** | Tarefa 3 (#89) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 13**.

Resumo: página nova com 4 cartões de número, um gráfico de barras em SVG acessível e a comparação LinkedIn x X com taxa normalizada. Como a Tarefa 3 foi reduzida, esta tarefa também acrescenta a agregação por dia da semana em `GET /metrics/summary` (Passo 2). Nenhuma biblioteca de gráficos.

Arquivos que você vai mexer:
- `backend/app/routes/metrics.py` - EDITAR, agregação `por_dia_semana` no resumo
- `frontend/src/pages/AnalyticsPage.jsx` - CRIAR, página do painel
- `frontend/src/components/analytics/StatCard.jsx`, `BarChart.jsx`, `PlatformCompare.jsx` - CRIAR
- `frontend/src/lib/api.js` - EDITAR, novo objeto `metricsApi`
- `frontend/src/App.jsx` e `frontend/src/components/layout/AppShell.jsx` - EDITAR, rota e item de menu

### Como medir se deu certo
- `GET /metrics/summary` devolve `por_dia_semana` no Swagger
- O gráfico tem `<title>`, `<desc>` e uma `<table>` equivalente em `sr-only` com os mesmos números
- A comparação mostra a taxa e o número de publicações de cada plataforma

### Definition of Done ✅
- [ ] `GET /metrics/summary` devolve `por_dia_semana`, testado pelo Swagger
- [ ] A página `/analytics` abre com os 4 cartões preenchidos
- [ ] O gráfico de barras é SVG inline, com `<title>`, `<desc>` e `<table>` equivalente em `sr-only`
- [ ] A comparação LinkedIn x X usa taxa normalizada e mostra o número de publicações de cada uma
- [ ] Nenhuma biblioteca de gráficos foi adicionada ao `package.json`
- [ ] PR aberto com `Closes #90` na descrição
