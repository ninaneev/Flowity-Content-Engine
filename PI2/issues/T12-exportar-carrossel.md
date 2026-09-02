<!-- TITLE: [PI2][T12][Frontend] Baixar o carrossel em PDF e a checklist de publicação -->
<!-- LABELS: area:frontend,prio:p1,pi2:midia,sprint:pi2 -->

## Tarefa 12 do PI 2 — Baixar o carrossel em PDF

| Campo | Valor |
|-------|-------|
| **Integrante** | Tiago Antonio Ferreira |
| **Branch** | `feat/pi2-t12-exportar-carrossel` |
| **Área** | Frontend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 3–4 horas |
| **Depende de** | Tarefa 8 (#82) e Tarefa 10 (#86) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 12**.

Resumo: criar o helper `apiDownload` com `responseType: "blob"`, o botão "Baixar PDF" com estado de carregando e erro visível, o botão "Copiar legenda" e o painel de checklist de publicação no LinkedIn. Sem download em ZIP dos PNGs.

Arquivos que você vai mexer:
- `frontend/src/lib/api.js` - EDITAR, helper `apiDownload`
- `frontend/src/components/carousel/CarouselExport.jsx` - CRIAR, botões de baixar e copiar
- `frontend/src/components/carousel/PublishChecklist.jsx` - CRIAR, checklist com ícone e texto
- `frontend/src/pages/CarouselPage.jsx` - EDITAR, área de exportação abaixo do builder

### Como medir se deu certo
- Clicar em "Baixar PDF" salva o arquivo e o botão mostra "Gerando PDF..." enquanto trabalha
- Com o backend desligado, aparece uma mensagem de erro em texto na tela
- Cada item da checklist mostra ícone e texto, e o estado não depende só da cor

### Definition of Done ✅
- [ ] `apiDownload` adicionado em `frontend/src/lib/api.js` com `responseType: "blob"`
- [ ] Botão "Baixar PDF" salva o arquivo e mostra o estado de carregando
- [ ] Erro de download aparece em texto visível, não só no console
- [ ] Botão "Copiar legenda" copia hook, body e cta e confirma a ação
- [ ] `PublishChecklist.jsx` mostra ícone mais texto em cada item
- [ ] PR aberto com `Closes #93` na descrição
