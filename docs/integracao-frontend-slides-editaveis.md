# Integração dos slides editáveis no Flowity

Este documento complementa `supabase-slides-editaveis.sql.md`. A tabela guarda textos e posições; o editor precisa carregar e salvar esses valores para que a edição persista ao atualizar a página.

## Fluxo esperado

1. Abrir `/carousel/:postId` a partir de uma publicação existente.
2. Carregar slides por `post_id`, ordenados por `position`.
3. Mostrar `slide_text` em campos editáveis.
4. Persistir edições, adições, remoções e reordenação.
5. Enviar os textos finais na ordem exibida para a geração do carrossel.

## Contrato de dados

```json
{
  "id": 101,
  "post_id": 4,
  "position": 1,
  "slide_text": "Texto editável do slide"
}
```

## Endpoints recomendados

| Método | Rota sugerida | Responsabilidade |
|---|---|---|
| GET | `/posts/{post_id}/slides` | Buscar slides ordenados. |
| PUT | `/posts/{post_id}/slides` | Salvar lista completa e posições em transação. |
| PATCH | `/posts/{post_id}/slides/{slide_id}` | Atualizar texto de um slide. |
| POST | `/posts/{post_id}/slides` | Adicionar slide, até 10. |
| DELETE | `/posts/{post_id}/slides/{slide_id}` | Remover slide, mantendo ao menos 3 para geração. |

As rotas acima são um contrato proposto e só devem ser documentadas como disponíveis depois de implementadas no backend.

## Regras de validação

- O post deve existir e pertencer ao usuário autorizado.
- Entre 3 e 10 slides para gerar.
- Texto não vazio, com trim e máximo de 220 caracteres.
- Posições únicas e sequenciais de 1 a N.
- Adição, remoção e reordenação salvas numa transação para evitar conflito na chave única `(post_id, position)`.
- Se a gravação falhar, mostrar erro e não indicar que a edição foi salva.
- O botão Gerar carrossel deve usar os textos atuais do editor, não uma cópia antiga.

## Componentes existentes

- `frontend/src/pages/CarouselPage.jsx` carrega a publicação e fornece `postId` ao editor.
- `frontend/src/components/carousel/CarouselBuilder.jsx` edita textos e chama `postsApi.render.carousel(postId, textos)`.
- `frontend/src/lib/carouselSlides.mjs` contém as regras de quantidade e a inicialização dos textos.

Para concluir a persistência, conecte o carregamento e o salvamento à tabela `public.carousel_slides` por meio de endpoints autenticados ou de um cliente Supabase com RLS correta. Não coloque `SUPABASE_SERVICE_ROLE_KEY` no frontend.

## Checklist de testes

- [ ] Posts antigos recebem 3 slides iniciais via SQL.
- [ ] Posts novos recebem 3 slides iniciais.
- [ ] Alterar o texto, atualizar a página e reabrir preserva a alteração.
- [ ] Reordenar preserva a ordem após recarregar.
- [ ] Adicionar/remover respeita limites.
- [ ] A geração usa exatamente os textos visíveis e a ordem atual.
- [ ] Usuário não consegue editar slides de posts sem permissão.
