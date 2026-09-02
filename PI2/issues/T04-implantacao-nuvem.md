<!-- TITLE: [PI2][T4][Infra] Publicar a aplicação em nuvem com banco gerenciado -->
<!-- LABELS: area:infra,prio:p0,sprint:pi2 -->

## Tarefa 4 do PI 2 — Implantação em nuvem

| Campo | Valor |
|-------|-------|
| **Integrante** | Andrea Nina Maciel Cressoni |
| **Branch** | `feat/pi2-t04-implantacao-nuvem` |
| **Área** | Infra |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 5–6 horas |
| **Depende de** | nada |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 4**.

Resumo: escolher o provedor e registrar a comparação, tirar toda configuração do código para variáveis de ambiente, subir um PostgreSQL gerenciado com `alembic upgrade head` rodando como etapa de release, restringir o CORS à origem do frontend publicado e deixar a mídia persistente por disco ou volume do provedor. O backend S3 atrás de uma interface `Storage` fica registrado como trabalho futuro e o workflow do GitHub Actions é parte da Tarefa 15.

Arquivos que você vai mexer:
- `infra/deploy/README.md` - procedimento de implantação e justificativa do provedor
- `backend/app/core/config.py` - `DATABASE_URL`, `CORS_ORIGINS` e `MEDIA_DIR`
- `.env.example` - novas chaves, sempre com valores vazios ou de exemplo
- `docker-compose.prod.yml` - composição de produção

### Como medir se deu certo
- `curl -i https://<dominio>/health` responde 200 em 3 tentativas seguidas, de outra rede
- Depois de reiniciar o serviço, `curl -I https://<dominio>/media/posts/1/card.png` volta 200
- `git log -p` no diff da branch: 0 credenciais versionadas

### Definition of Done ✅
- [ ] Aplicação acessível por URL pública (frontend e `/docs` do backend), testada de outra rede
- [ ] PostgreSQL gerenciado em uso, com `alembic upgrade head` aplicado como etapa de release
- [ ] Imagem em `/media/...` continua acessível depois de reiniciar o serviço
- [ ] `.env.example` atualizado e nenhum segredo versionado
- [ ] `CORS_ORIGINS` restrito à origem do frontend publicado
- [ ] `infra/deploy/README.md` com o procedimento completo e a justificativa do provedor
- [ ] PR aberto com `Closes #95` na descrição
