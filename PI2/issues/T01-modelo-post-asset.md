<!-- TITLE: [PI2][T1][Backend] Criar o modelo PostAsset (imagens e slides do post) -->
<!-- LABELS: area:backend,prio:p0,pi2:midia,sprint:pi2 -->

## Tarefa 1 do PI 2 — Modelo PostAsset

| Campo | Valor |
|-------|-------|
| **Integrante** | Davi Corrêa Bueno |
| **Branch** | `feat/pi2-t01-modelo-post-asset` |
| **Área** | Backend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 3–4 horas |
| **Depende de** | nada |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 1**.

Resumo: criar a tabela `post_assets`, que guarda cada arquivo de imagem ligado a um post, a ordem dele dentro do carrossel e o texto alternativo obrigatório. Entra também o relacionamento `Post.assets` e a migração Alembic. Nenhum endpoint nesta tarefa: as Tarefas 5, 6, 7 e 8 dependem só do modelo.

Arquivos que você vai mexer:
- `backend/app/models/post_asset.py` - novo modelo ORM `PostAsset`
- `backend/app/models/post.py` - acrescenta o relacionamento `Post.assets`
- `backend/app/db/database.py` - registra o módulo em `create_tables()`
- `backend/alembic/` e `backend/alembic.ini` - configuração e revisão `0001_criar_post_assets`

### Como medir se deu certo
- `PRAGMA table_info(post_assets)` lista 13 colunas, com `alt_text` marcado como `notnull = 1`
- `alembic upgrade head`, `alembic downgrade -1` e `alembic upgrade head` terminam com exit code 0
- Inserir slides nas posições 2, 0 e 1 e ler `post.assets` devolve a ordem `[0, 1, 2]`

### Definition of Done ✅
- [ ] `backend/app/models/post_asset.py` criado com as 13 colunas e `alt_text` obrigatório
- [ ] `Post.assets` declarado com `order_by="PostAsset.position"` e `cascade="all, delete-orphan"`
- [ ] `create_tables()` importa `post_asset`
- [ ] `alembic upgrade head`, `downgrade -1` e `upgrade head` rodam sem erro
- [ ] `GET /posts/` continua respondendo 200
- [ ] PR aberto com `Closes #79` na descrição
