<!-- TITLE: [PI2][T8][Backend] Gerar o carrossel do LinkedIn (slides PNG e PDF) -->
<!-- LABELS: area:backend,prio:p0,pi2:midia,sprint:pi2 -->

## Tarefa 8 do PI 2 — Carrossel do LinkedIn

| Campo | Valor |
|-------|-------|
| **Integrante** | Davi Corrêa Bueno |
| **Branch** | `feat/pi2-t08-carrossel` |
| **Área** | Backend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 5–6 horas |
| **Depende de** | Tarefa 5 (#80) e Tarefa 7 (#81) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 8**.

Resumo: dividir o corpo do post em slides (capa, conteúdo e CTA), renderizar cada slide em 1080x1350 reaproveitando as funções do serviço da Tarefa 7, numerar os slides no rodapé e unir tudo em um único PDF, que é o formato que o LinkedIn ingere. Limite de 3 a 10 slides. Um endpoint só: `POST /posts/{id}/render/carousel`.

Arquivos que você vai mexer:
- `backend/app/services/carousel_renderer.py` - divisão, renderização e junção em PDF
- `backend/app/schemas/post_asset.py` - `RenderCarouselRequest` e `CarouselResponse`
- `backend/app/routes/assets.py` - o endpoint de carrossel

### Como medir se deu certo
- Pedir 2 slides responde 422; sem body, o post é dividido automaticamente e responde 201
- `Image.open(<slide>).size` imprime `(1080, 1350)` em 100% dos PNGs gerados
- O PDF em `pdf_url` abre com uma página por slide

### Definition of Done ✅
- [ ] `dividir_em_slides` monta capa, conteúdo e CTA a partir do corpo do post
- [ ] Carrossel com menos de 3 ou mais de 10 slides responde 422
- [ ] Todos os PNGs gerados têm exatamente 1080x1350 e trazem a numeração do slide
- [ ] O PDF tem uma página por slide e a URL dele volta em `pdf_url`
- [ ] Cada slide vira um `PostAsset` com `kind="carousel_slide"`, `position` sequencial e `alt_text` próprio
- [ ] O serviço reaproveita `quebrar_em_linhas` e `ajustar_fonte` da Tarefa 7
- [ ] PR aberto com `Closes #82` na descrição
