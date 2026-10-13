# Integração dos slides editáveis no carrossel

Complementa [o SQL do Supabase](./supabase-slides-editaveis.sql.md). A migration prepara o armazenamento; esta etapa liga o armazenamento à interface.

## Fluxo esperado

1. Ao abrir um post no Carousel Builder, buscar os slides para o `post_id` e ordenar por `position`.
2. Mostrar `slide_text` em campos de texto editáveis.
3. Salvar alterações no backend/Supabase.
4. Ao adicionar, remover ou reordenar, persistir a ordem final.
5. Gerar o carrossel usando os textos atuais na ordem visível.

## Formato de um slide

```json
{
  "id": 101,
  "post_id": 4,
  "position": 1,
  "slide_text": "Texto editável do slide"
}
```

## Endpoints sugeridos

| Método | Rota sugerida | Comportamento |
|---|---|---|
| GET | `/api/posts/{post_id}/slides` | Lista slides por posição. |
| PUT | `/api/posts/{post_id}/slides` | Salva textos e ordem em transação. |
| PATCH | `/api/posts/{post_id}/slides/{slide_id}` | Atualiza texto de um slide. |
| POST | `/api/posts/{post_id}/slides` | Adiciona slide até o limite de 10. |
| DELETE | `/api/posts/{post_id}/slides/{slide_id}` | Remove slide validando limites e autorização. |

Essas rotas são uma proposta de contrato, não uma declaração de que já existem.

## Validação

- Confirmar que cada slide pertence ao post indicado.
- Rejeitar texto vazio; aplicar trim.
- Limitar texto a 220 caracteres.
- Permitir de 3 a 10 slides para a geração.
- Reordenar com posições únicas e sequenciais começando em 1.
- Salvar reordenação em transação para respeitar a chave única `(post_id, position)`.
- Autenticar e autorizar cada operação no backend.
- Evitar autosave atrasado sobrescrevendo alterações recentes.

## Integração no React

O componente `frontend/src/components/carousel/CarouselBuilder.jsx` mantém uma lista de textos e chama `postsApi.render.carousel(postId, textos)` para gerar. Para persistir as edições:

1. Ao abrir, carregue os slides da API e mantenha IDs estáveis.
2. Exiba `slide_text` em cada `SlideCard`.
3. Salve alterações e a ordem final por endpoint.
4. Mostre estados de carregamento, sucesso e erro.
5. Antes de gerar, valide a lista e envie os textos finais na ordem atual.
6. Se salvar falhar, informe o usuário e recarregue os dados persistidos.

## Checklist

- [ ] Migration aplicada no Supabase correto.
- [ ] Posts existentes recebem slides iniciais.
- [ ] Novos posts recebem slides iniciais.
- [ ] Editar, atualizar a página e reabrir preserva o texto.
- [ ] Reordenar persiste a ordem.
- [ ] Adicionar/remover respeita os limites.
- [ ] A geração usa os textos exibidos.
- [ ] A autorização impede edição indevida.
- [ ] RLS/políticas ou endpoints autenticados protegem a tabela.

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend. Se o backend usa uma credencial privilegiada, ele deve autenticar o usuário e autorizar acesso ao post antes de ler ou gravar slides.
