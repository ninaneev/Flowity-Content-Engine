<!-- TITLE: [PI2][T5][Backend] API de imagens do post: enviar, listar, reordenar e remover -->
<!-- LABELS: area:backend,prio:p0,pi2:midia,sprint:pi2 -->

## Tarefa 5 do PI 2 — API de imagens do post

| Campo | Valor |
|-------|-------|
| **Integrante** | Jeferson Ferraz Ferreira |
| **Branch** | `feat/pi2-t05-api-assets` |
| **Área** | Backend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–5 horas |
| **Depende de** | Tarefa 1 (#79) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 5**.

Resumo: cinco endpoints de mídia sobre a tabela criada na Tarefa 1 — enviar (`POST /posts/{id}/assets`), listar, editar metadados (`PATCH /assets/{id}`), reordenar (`PUT /posts/{id}/assets/order`) e remover. Entram a validação de tipo (PNG, JPEG e WebP) e de tamanho (5 MB), a configuração de `MEDIA_DIR` e o `StaticFiles` servindo `/media`. O envio já exige `alt_text` no formulário.

Arquivos que você vai mexer:
- `backend/app/schemas/post_asset.py` - `PostAssetResponse`, `PostAssetUpdate`, `AssetOrderUpdate`
- `backend/app/repositories/post_assets.py` - queries do novo recurso
- `backend/app/routes/assets.py` - os cinco endpoints e os helpers `_media_root` e `_com_url`
- `backend/app/core/config.py` - `MEDIA_DIR`, `MEDIA_URL_PREFIX` e `MAX_UPLOAD_BYTES`
- `backend/app/main.py`, `.gitignore` e `.env.example`

### Como medir se deu certo
- Os cinco endpoints respondem no Swagger: 201 no envio e 204 na remoção
- Enviar um PDF responde 415; enviar um arquivo de 6 MB responde 413
- A imagem enviada abre em `http://localhost:8000/media/posts/1/<arquivo>.png`

### Definition of Done ✅
- [ ] Os cinco endpoints respondem: envio (201), listagem, edição, reordenação e remoção (204)
- [ ] Arquivo fora de PNG/JPEG/WebP recusado com 415 e acima de 5 MB recusado com 413
- [ ] `MEDIA_DIR` montado com `StaticFiles`, imagem acessível por `/media/...`
- [ ] Todas as rotas novas aparecem em `/docs` com `summary` e `response_model` preenchidos
- [ ] Os erros seguem um formato único de resposta em todas as rotas novas
- [ ] `backend/media/` no `.gitignore`, nenhum arquivo de mídia versionado
- [ ] PR aberto com `Closes #80` na descrição
