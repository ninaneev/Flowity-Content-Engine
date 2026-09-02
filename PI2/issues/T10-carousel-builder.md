<!-- TITLE: [PI2][T10][Frontend] Montar e pré-visualizar o carrossel do LinkedIn -->
<!-- LABELS: area:frontend,prio:p0,pi2:midia,sprint:pi2 -->

## Tarefa 10 do PI 2 — Montar o carrossel do LinkedIn

| Campo | Valor |
|-------|-------|
| **Integrante** | Roger Luiz de Paula |
| **Branch** | `feat/pi2-t10-carousel-builder` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 5–6 horas |
| **Depende de** | Tarefa 8 (#82) e Tarefa 9 (#85) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 10**.

Resumo: criar a página `/carousel/:postId`, dividir o corpo do post em slides e permitir editar o texto de cada um. A reordenação é feita só por botões "mover para cima" e "mover para baixo", com limite de 3 a 10 slides. Sem drag-and-drop: os botões são mais simples e já são a via acessível.

Arquivos que você vai mexer:
- `frontend/src/pages/CarouselPage.jsx` - CRIAR, rota `/carousel/:postId`
- `frontend/src/components/carousel/CarouselBuilder.jsx` - CRIAR, lista de slides e limites
- `frontend/src/components/carousel/SlideCard.jsx` - CRIAR, edição do texto e botões de ordem
- `frontend/src/lib/carouselSlides.mjs` - CRIAR, função pura `dividirEmSlides`
- `frontend/src/App.jsx` e `frontend/src/components/layout/AppShell.jsx` - EDITAR, rota e item de menu

### Como medir se deu certo
- Abrir `/carousel/:postId` mostra os slides já divididos a partir do corpo do post
- Os botões de mover trocam a ordem e ficam desabilitados no primeiro e no último slide
- Com menos de 3 slides, o botão "Gerar carrossel" fica desabilitado

### Definition of Done ✅
- [ ] Rota `/carousel/:postId` registrada no `App.jsx` e item "Carrossel" no `AppShell.jsx`
- [ ] O corpo do post é dividido em slides automaticamente ao abrir a página
- [ ] O texto de cada slide pode ser editado
- [ ] A ordem muda pelos botões "mover para cima" e "mover para baixo", sem drag-and-drop
- [ ] O botão "Gerar carrossel" só habilita com 3 a 10 slides e chama `POST /posts/{id}/render/carousel`
- [ ] PR aberto com `Closes #86` na descrição
