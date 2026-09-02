<!-- TITLE: [PI2][T14][Full-stack] Alerta de post abaixo do limite de engajamento -->
<!-- LABELS: area:backend,area:frontend,prio:p1,pi2:dados,sprint:pi2 -->

## Tarefa 14 do PI 2 — Alerta de engajamento baixo

| Campo | Valor |
|-------|-------|
| **Integrante** | Tiago Antonio Ferreira |
| **Branch** | `feat/pi2-t14-alertas-engajamento` |
| **Área** | Backend e Frontend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 3–4 horas |
| **Depende de** | Tarefa 3 (#89) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 14**.

Resumo: criar a tabela `alert_settings` com um único limite configurável (taxa de engajamento), as rotas `GET/PUT /settings/alerts` e `GET /alerts`, a seção de configuração na SettingsPage e a lista de alertas com `role="status"`. Limite padrão de 2%.

Arquivos que você vai mexer:
- `backend/app/models/alert_setting.py`, `schemas/alert.py`, `routes/alerts.py` - CRIAR
- `backend/app/main.py` e `backend/app/db/database.py` - EDITAR, registrar router e tabela
- `frontend/src/lib/api.js` - EDITAR, novo objeto `alertsApi`
- `frontend/src/components/alerts/AlertBanner.jsx` - CRIAR, lista acessível de alertas
- `frontend/src/pages/SettingsPage.jsx` e `AnalyticsPage.jsx` - EDITAR, configuração e banner

### Como medir se deu certo
- Mudar o limite na SettingsPage e recarregar mantém o valor salvo
- `GET /alerts` só devolve posts com taxa abaixo do limite configurado
- Cada alerta mostra ícone e texto, sem depender só da cor

### Definition of Done ✅
- [ ] Tabela `alert_settings` criada, com um único limite configurável
- [ ] `GET /settings/alerts`, `PUT /settings/alerts` e `GET /alerts` testados pelo Swagger
- [ ] A SettingsPage salva o limite e confirma a gravação em texto
- [ ] `AlertBanner.jsx` lista os alertas num bloco `role="status"`, com ícone mais texto
- [ ] O limite padrão é 2% quando ninguém configurou nada
- [ ] PR aberto com `Closes #91` na descrição
