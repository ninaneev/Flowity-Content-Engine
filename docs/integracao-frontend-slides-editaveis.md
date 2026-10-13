# Integração dos slides editáveis no carrossel

Este guia complementa [o SQL do Supabase](./supabase-slides-editaveis.sql.md). A migration prepara o armazenamento; esta etapa liga o armazenamento à interface.

## Fluxo esperado

1. O usuário abre um post no Carousel Builder.
2. O frontend busca os slides daquele `post_id`, ordenados por `position`.
3. Cada slide aparece em um campo de texto editável.
4. Ao salvar, o backend persiste o texto em `public.carousel_slides.slide_text`.
5. Adicionar, remover ou reordenar slides atualiza a tabela e mantém posições sequenciais.
6. O botão “Gerar carrossel” envia os textos atuais, na ordem, para o renderer já existente.

## Contrato de dados sugerido

Cada slide retornado à interface deve conter:

```json
{
  "id": 101,
  "post_id": 4,
  "position": 1,
  "slide_text": "Texto editável do slide"
}
```

A fonte de verdade para edição deve ser `carousel_slides`, e não somente um estado React temporário.

## Endpoints sugeridos para o backend

Adapte os nomes ao padrão atual das rotas do projeto.

| Método | Rota sugerida | Comportamento |
|---|---|---|
| GET | `/api/posts/{post_id}/slides` | Lista os slides em ordem crescente de `position`. |
| PUT | `/api/posts/{post_id}/slides` | Salva a lista completa de textos e sua ordem em uma transação. |
| PATCH | `/api/posts/{post_id}/slides/{slide_id}` | Atualiza o texto de um slide específico. |
| POST | `/api/posts/{post_id}/slides` | Adiciona um slide, respeitando o limite de 10. |
| DELETE | `/api/posts/{post_id}/slides/{slide_id}` | Remove um slide se o carrossel continuar válido para o fluxo do produto. |

Estes são contratos propostos, não rotas que já estejam implementadas.

## Regras de validação

- O slide pertence ao post indicado pela rota.
- O texto não pode ser vazio; aplique trim antes de validar.
- Limite o texto a 220 caracteres, alinhado à regra existente no frontend.
- O carrossel pode ter no máximo 10 slides; a geração exige no mínimo 3.
- Reordene com posições únicas e sequenciais começando em 1.
- Salve a lista inteira em transação para evitar colisões na restrição única `(post_id, position)`.
- Valide autenticação e autorização no backend para cada operação.
- Evite substituir alterações mais recentes por um autosave atrasado; considere debounce ou botão explícito de salvar.

## Integração com o componente React

O componente `frontend/src/components/carousel/CarouselBuilder.jsx` já trabalha com uma lista de textos e chama `postsApi.render.carousel(postId, textos)` para gerar. Para completar a persistência:

1. Ao abrir o componente, carregue os slides da API e converta os registros em itens locais com IDs estáveis.
2. Mostre `slide_text` em cada `SlideCard`.
3. Ao editar, atualize o estado local e persista por endpoint (ou use botão “Salvar alterações”).
4. Ao mover, adicionar ou remover, persista também a ordem final.
5. Antes de gerar, valide a quantidade e os textos e envie a lista final em ordem para o renderer.
6. Mostre mensagens de carregamento, sucesso e erro, e recarregue os dados se a persistência falhar.

O helper `frontend/src/lib/carouselSlides.mjs` já define o mínimo de 3, máximo de 10 e limite de 220 caracteres. Reutilize essas regras para manter frontend e backend consistentes.

## Verificação manual

- [ ] A migration SQL foi executada no projeto Supabase correto.
- [ ] Todos os posts existentes aparecem com seus slides iniciais.
- [ ] Um post novo recebe três slides iniciais.
- [ ] Editar um texto, atualizar a página e reabrir mantém a edição.
- [ ] Reordenar slides persiste a nova ordem.
- [ ] Adicionar e remover respeita os limites.
- [ ] Gerar usa exatamente os textos exibidos, na ordem visível.
- [ ] Usuários sem permissão não conseguem editar slides de outros usuários.
- [ ] RLS/políticas ou endpoints autenticados protegem a tabela.

## Segurança

Não coloque `SUPABASE_SERVICE_ROLE_KEY` no frontend. Como o projeto precisa de escrita, configure a autorização com o modelo de autenticação já adotado pelo sistema. Se a API de backend acessar o Supabase com credencial privilegiada, ela deve autenticar o usuário e autorizar o acesso ao post antes de ler ou gravar slides.
