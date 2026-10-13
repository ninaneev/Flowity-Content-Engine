# Correção: “Não foi possível identificar a publicação”

## Causa provável

A tela de edição precisa ser aberta com o ID de um post existente, na rota `/carousel/{postId}`. Abrir apenas `/carousel` não identifica a publicação à qual o PDF e os slides pertencem. O endpoint de geração é `POST /posts/{post_id}/render/carousel`.

## Alterações incluídas nesta correção

- Adiciona o link **Editar carrossel** em cada cartão do Pipeline. O link abre `/carousel/{id}` usando o ID real do post.
- Impede a chamada de geração se o `postId` estiver ausente ou inválido e apresenta uma mensagem que explica como corrigir.
- Mantém a edição dos textos, a pré-visualização, a ordem dos slides e as regras de 3 a 10 slides.

## Passo a passo para testar localmente

1. Faça merge deste Pull Request na branch de trabalho (ou aplique os dois arquivos alterados).
2. No terminal, na raiz do projeto, atualize a branch:
   ```bash
   git pull
   ```
3. Inicie/reinicie o backend e o frontend conforme o README do projeto. O frontend normalmente abre em `http://localhost:5173` e a API em `http://localhost:8000`.
4. Entre no Flowity e abra **Pipeline**.
5. Escolha um post existente e clique em **Editar carrossel**. Confirme que a URL tem um ID numérico, por exemplo `/carousel/4`, não apenas `/carousel`.
6. Confirme que o post é carregado e que há pelo menos três slides com texto.
7. Edite o texto de cada slide e clique em **Gerar carrossel**.
8. Se funcionar, a tela deverá mostrar os PNGs gerados e o PDF. Faça download do PDF para conferir as páginas e a ordem.

## Se ainda ocorrer erro

### A. Verificar a URL e o ID

A URL deve ser `http://localhost:5173/carousel/ID`, onde `ID` é um número de post real. Não invente um ID. Volte ao Pipeline e use **Editar carrossel** no post desejado.

### B. Confirmar que o backend está ativo

Abra `http://localhost:8000/health`. O resultado esperado é JSON com `"status": "ok"`. Se a página não abrir, inicie o backend e confira o terminal por erros de inicialização.

### C. Verificar a rota de geração

Abra `http://localhost:8000/docs`, procure por `POST /posts/{post_id}/render/carousel`. Se a rota não aparecer, o backend em execução pode estar numa branch/versão antiga. Atualize para a branch que contém `backend/app/routes/assets.py` e reinicie o backend.

### D. Consultar a resposta real da API

1. Abra as ferramentas do navegador com F12.
2. Selecione **Network/Rede** e clique em **Gerar carrossel** novamente.
3. Abra a requisição `/posts/ID/render/carousel`.
4. Confira o status HTTP e a aba **Response/Resposta**:
   - `404`: ID de post inexistente ou backend sem a rota.
   - `401`: sessão/token expirado; entre novamente no sistema.
   - `422`: há slide vazio ou quantidade fora de 3 a 10.
   - `500`: veja o terminal do backend para encontrar a exceção.
   - `200` ou `201`: a geração foi concluída; se as imagens não aparecem, confira a resposta `slides`, `pdf_url` e o servidor de mídia.

### E. Confirmar a base de dados

A rota de renderização procura o post pelo ID no banco configurado no backend (`DATABASE_URL`). Se o post aparece no Supabase mas não existe no banco que o backend local está usando, o endpoint retornará 404. Confirme o `.env` e a `DATABASE_URL` do backend; não publique credenciais em issues ou capturas de tela.

## Nota sobre persistência dos textos

Esta correção garante que a geração esteja ligada a um post e use os textos enviados pelo editor. Para manter as edições após atualizar a página, o carregamento/salvamento dos textos em `public.carousel_slides` ainda precisa estar conectado ao frontend e ao backend. A geração atual usa os textos enviados na requisição e armazena os PNGs gerados como assets do post.
