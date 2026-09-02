<!-- TITLE: [PI2][T2][Frontend] Acessibilidade: foco visível, contraste, skip link e HTML semântico -->
<!-- LABELS: area:frontend,prio:p0,pi2:acessibilidade,sprint:pi2 -->

## Tarefa 2 do PI 2 — Acessibilidade da aplicação

| Campo | Valor |
|-------|-------|
| **Integrante** | Pedro Luiz Simonetti Filho |
| **Branch** | `feat/pi2-t02-acessibilidade` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–6 horas |
| **Depende de** | nada |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 2**.

Resumo: cinco correções fechadas de acessibilidade, nada além delas. (1) `div` clicável do `CalendarDayCell` vira `button`; (2) landmarks `header`/`nav`/`main` no `AppShell`; (3) skip link "Pular para o conteúdo principal"; (4) `:focus-visible` com contorno de 2px no ciano; (5) os dois contrastes reprovados, `text.muted` de `#5C6A82` (3,66:1) para `#7C8AA3` (5,70:1) e o texto do `.btn-primary` de branco (1,76:1 no ciano) para `#07080F` (11,35:1). Fecha com auditoria no axe DevTools.

Arquivos que você vai mexer:
- `frontend/src/components/calendar/CalendarDayCell.jsx` - `button` no lugar da `div` clicável
- `frontend/src/components/layout/AppShell.jsx` - landmarks e skip link
- `frontend/src/styles/theme.css` - `.skip-link`, `:focus-visible` e cor do `.btn-primary`
- `frontend/tailwind.config.js` - token `text.muted`
- `PI2/evidencias/` - capturas do axe DevTools antes e depois

### Como medir se deu certo
- axe DevTools ("Scan ALL of my page") em `/` e `/sources`: 0 violações críticas e 0 sérias
- Todo texto com contraste maior ou igual a 4,5:1 sobre o fundo `#07080F`
- Carregar `/`, apertar Tab uma vez: o skip link aparece; apertar Enter leva o foco ao `<main>`

### Definition of Done ✅
- [ ] A `div` clicável do `CalendarDayCell.jsx` virou `<button type="button">` com `aria-label`
- [ ] `AppShell.jsx` tem `header`, `nav` com `aria-label` e `main` com `id="conteudo-principal"`
- [ ] Skip link invisível por padrão e visível ao receber foco pelo teclado
- [ ] `:focus-visible` com contorno de 2px em `#1CD8DE` no `theme.css`
- [ ] `text.muted` = `#7C8AA3` e texto do `.btn-primary` = `#07080F`
- [ ] Capturas do axe DevTools antes e depois anexadas no PR, com 0 violações críticas
- [ ] PR aberto com `Closes #87` na descrição
