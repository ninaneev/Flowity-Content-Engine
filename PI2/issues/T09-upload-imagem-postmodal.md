<!-- TITLE: [PI2][T9][Frontend] Enviar imagem no PostModal com texto alternativo obrigatório -->
<!-- LABELS: area:frontend,prio:p0,pi2:midia,sprint:pi2 -->

## Tarefa 9 do PI 2 — Upload de imagem no post

| Campo | Valor |
|-------|-------|
| **Integrante** | Pedro Luiz Simonetti Filho |
| **Branch** | `feat/pi2-t09-upload-imagem` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–5 horas |
| **Depende de** | Tarefa 5 (#80) |

### O que fazer

Passo a passo completo em [`PI2/team-tasks-pi2.md`](https://github.com/ninaneev/Flowity-Content-Engine/blob/main/PI2/team-tasks-pi2.md) → **Tarefa 9**.

Resumo: criar um componente de upload com seletor de arquivo, pré-visualização e validação de tipo e tamanho no navegador. A imagem só pode ser salva com texto alternativo preenchido, entre 10 e 300 caracteres. Sem drag-and-drop.

Arquivos que você vai mexer:
- `frontend/src/components/posts/PostImageUploader.jsx` - CRIAR, seletor de arquivo, preview e campo de alt text
- `frontend/src/components/posts/PostModal.jsx` - EDITAR, nova seção "Imagens do post"
- `frontend/src/lib/api.js` - EDITAR, novo objeto `assetsApi`

### Como medir se deu certo
- Um arquivo `.txt` ou uma imagem acima de 5 MB é recusado com mensagem em texto
- Com o alt text vazio, o botão de salvar continua desabilitado
- Depois de enviar, a imagem aparece na lista do post com o alt text ao lado

### Definition of Done ✅
- [ ] `PostImageUploader.jsx` criado, com seletor de arquivo e `<label>` de texto real
- [ ] Arquivo fora de PNG/JPEG ou acima de 5 MB é recusado com mensagem em texto
- [ ] A pré-visualização da imagem aparece antes do envio
- [ ] O botão de salvar fica desabilitado enquanto o alt text tiver menos de 10 caracteres
- [ ] `assetsApi` adicionado em `frontend/src/lib/api.js` e usado pelo `PostModal.jsx`
- [ ] PR aberto com `Closes #85` na descrição
