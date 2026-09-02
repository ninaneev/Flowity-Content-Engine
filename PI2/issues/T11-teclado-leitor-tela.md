<!-- TITLE: [PI2][T11][Frontend] Navegação por teclado e leitor de tela no carrossel -->
<!-- LABELS: area:frontend,prio:p1,pi2:acessibilidade,sprint:pi2 -->

## Tarefa 11 do PI 2 — Teclado e leitor de tela no carrossel

| Campo | Valor |
|-------|-------|
| **Integrante** | Roger Luiz de Paula |
| **Branch** | `feat/pi2-t11-teclado-leitor-tela` |
| **Área** | Frontend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 3–4 horas |
| **Depende de** | Tarefa 10 (#86) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 11**.

Resumo: setas esquerda e direita andam entre os slides, Enter ou Espaço abrem a edição, Escape fecha o modal e devolve o foco a quem o abriu. Cada slide ganha `aria-label="Slide 2 de 7"` e a troca é anunciada numa região `aria-live`. Inclui um roteiro curto de teste manual com o NVDA.

Arquivos que você vai mexer:
- `frontend/src/components/carousel/CarouselBuilder.jsx` - EDITAR, teclas de seta e região `aria-live`
- `frontend/src/components/carousel/SlideCard.jsx` - EDITAR, `aria-label` e edição por Enter ou Espaço
- `frontend/src/components/posts/PostModal.jsx` - EDITAR, Escape fecha e devolve o foco
- `PI2/evidencias/nvda-roteiro.md` - CRIAR, resultado do teste manual

### Como medir se deu certo
- Dá para montar o carrossel inteiro sem tocar no mouse
- O NVDA fala "Slide 2 de 7" ao trocar de slide
- Ao fechar o modal com Escape, o foco volta para o botão que o abriu

### Definition of Done ✅
- [ ] Setas esquerda e direita mudam o slide atual
- [ ] Enter ou Espaço abrem a edição do slide e movem o foco para o campo de texto
- [ ] Cada slide tem `aria-label="Slide N de M"`
- [ ] A troca de slide é anunciada numa região `aria-live="polite"`
- [ ] Escape fecha o `PostModal` e devolve o foco a quem o abriu
- [ ] `PI2/evidencias/nvda-roteiro.md` preenchido com o resultado dos 5 passos
- [ ] PR aberto com `Closes #88` na descrição
