<!-- TITLE: [PI2][T3][Backend] Criar o modelo PostMetric e o registro manual de métricas -->
<!-- LABELS: area:backend,prio:p1,pi2:dados,sprint:pi2 -->

## Tarefa 3 do PI 2 — Modelo PostMetric

| Campo | Valor |
|-------|-------|
| **Integrante** | João Maike Silva de Jesus |
| **Branch** | `feat/pi2-t03-modelo-post-metric` |
| **Área** | Backend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 3–4 horas |
| **Depende de** | nada |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 3**.

Resumo: criar a tabela `post_metrics` (impressões, curtidas, comentários, compartilhamentos e cliques por plataforma), a migração e dois endpoints: `POST /posts/{id}/metrics` para o registro manual e `GET /metrics/summary` com os totais por plataforma e a taxa de engajamento média. Importação de CSV e agregação por dia da semana e por horário ficam de fora: são parte da Tarefa 13.

Arquivos que você vai mexer:
- `backend/app/models/post_metric.py` - novo modelo ORM `PostMetric`
- `backend/app/models/post.py` - acrescenta o relacionamento `Post.metrics`
- `backend/app/schemas/metric.py` - `MetricCreate`, `MetricResponse` e `MetricsSummary`
- `backend/app/repositories/metrics.py` - gravação e agregação
- `backend/app/routes/metrics.py` e `backend/app/main.py` - as duas rotas e o registro do router
- `backend/alembic/versions/0006_criar_post_metrics.py` - migração

### Como medir se deu certo
- `POST /posts/1/metrics` responde 201; com um `post_id` inexistente responde 404
- `platform` fora de `linkedin`/`x` responde 422
- `GET /metrics/summary` devolve `total_publicados`, `engagement_rate` e `por_plataforma`

### Definition of Done ✅
- [ ] Tabela `post_metrics` criada por migração Alembic que sobe e desce sem erro
- [ ] `Post.metrics` com `cascade="all, delete-orphan"` e `order_by="PostMetric.collected_at"`
- [ ] `POST /posts/{id}/metrics` responde 201 e 404 quando o post não existe
- [ ] `GET /metrics/summary` devolve totais por plataforma e a taxa de engajamento média
- [ ] `platform` fora de `linkedin`/`x` é recusado com 422
- [ ] PR aberto com `Closes #89` na descrição
