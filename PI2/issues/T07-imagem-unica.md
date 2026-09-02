<!-- TITLE: [PI2][T7][Backend] Gerar a imagem única do post com Pillow -->
<!-- LABELS: area:backend,prio:p1,pi2:midia,sprint:pi2 -->

## Tarefa 7 do PI 2 — Imagem única com Pillow

| Campo | Valor |
|-------|-------|
| **Integrante** | Diego Gustavo Franco |
| **Branch** | `feat/pi2-t07-imagem-unica` |
| **Área** | Backend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 4–5 horas |
| **Depende de** | Tarefa 5 (#80) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 7**.

Resumo: um serviço de renderização com Pillow que desenha um card 1200x1200 com as cores da marca Flowity (fundo `#080810`, roxo `#9C83F7`, ciano `#1CD8DE`), quebra o gancho em linhas e reduz o corpo da fonte até o texto caber. Um endpoint só, `POST /posts/{id}/render/image`, que salva o resultado como `PostAsset` já com o texto alternativo gerado a partir do gancho.

Arquivos que você vai mexer:
- `backend/requirements.txt` - acrescenta `pillow==11.0.0`
- `backend/app/services/image_renderer.py` - o serviço de renderização
- `backend/app/assets/fonts/` - `Inter-Bold.ttf` e `Inter-Regular.ttf`
- `backend/app/schemas/post_asset.py` - `RenderImageRequest`
- `backend/app/routes/assets.py` - o endpoint de renderização

### Como medir se deu certo
- `POST /posts/1/render/image` responde 201 e a URL devolvida abre a imagem no navegador
- `Image.open(<arquivo>).size` imprime exatamente `(1200, 1200)`
- O asset criado nasce com `alt_text` preenchido, no formato "Cartão com o texto: ..."

### Definition of Done ✅
- [ ] `pillow==11.0.0` no `requirements.txt` e serviço funcionando sem as fontes embarcadas
- [ ] `image_renderer.py` implementa `quebrar_em_linhas`, `ajustar_fonte` e `alt_text_padrao`
- [ ] `POST /posts/{id}/render/image` responde 201 e 404 quando o post não existe
- [ ] O PNG gerado tem exatamente 1200x1200 e usa as cores da marca
- [ ] O asset criado nasce com `alt_text` preenchido a partir do hook
- [ ] Captura do card gerado anexada no PR
- [ ] PR aberto com `Closes #81` na descrição
