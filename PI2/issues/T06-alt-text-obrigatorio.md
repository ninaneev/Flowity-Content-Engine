<!-- TITLE: [PI2][T6][Backend] Tornar o texto alternativo obrigatório na API -->
<!-- LABELS: area:backend,prio:p0,pi2:acessibilidade,sprint:pi2 -->

## Tarefa 6 do PI 2 — Texto alternativo obrigatório

| Campo | Valor |
|-------|-------|
| **Integrante** | Jeferson Ferraz Ferreira |
| **Branch** | `feat/pi2-t06-alt-text-obrigatorio` |
| **Área** | Backend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 3–4 horas |
| **Depende de** | Tarefa 1 (#79) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 6**.

Resumo: um serviço de acessibilidade com a regra única do `alt_text` (de 10 a 300 caracteres, recusando termos genéricos como "imagem" ou "foto"), aplicado por validador Pydantic no envio e na edição do asset, mais o bloqueio de mudar um post com imagem sem descrição para `scheduled` ou `published`, respondendo 422. Base normativa: Lei 13.146/2015, artigo 63, e eMAG, recomendação 3.6.

Arquivos que você vai mexer:
- `backend/app/services/accessibility.py` - regra reutilizável de validação
- `backend/app/schemas/post_asset.py` - `field_validator` em `PostAssetUpdate` e `AltTextIn`
- `backend/app/routes/assets.py` - valida no envio e no `PATCH /assets/{id}`
- `backend/app/routes/posts.py` - bloqueio de status e o novo verbo `PATCH /posts/{id}`
- `backend/app/repositories/post_assets.py` - `sem_alt_text_valido(db, post_id)`

### Como medir se deu certo
- Enviar imagem com `alt_text` igual a `"foto"` responde 422; com uma descrição real responde 201
- `PATCH /posts/{id}` com `status: "scheduled"` e imagem sem alt responde 422 com o código `acessibilidade_pendente`
- Nenhuma linha de `post_assets` fica com `alt_text` fora da faixa de 10 a 300 caracteres

### Definition of Done ✅
- [ ] `accessibility.py` valida tamanho de 10 a 300 caracteres e recusa termos genéricos
- [ ] Upload com `alt_text` inválido responde 422 com mensagem em português
- [ ] `PATCH /assets/{id}` usa o mesmo validador
- [ ] Mudar um post com imagem sem alt para `scheduled` ou `published` responde 422 com o código `acessibilidade_pendente`
- [ ] `PATCH /posts/{id}` existe e funciona igual ao `PUT`
- [ ] PR aberto com `Closes #83` na descrição
