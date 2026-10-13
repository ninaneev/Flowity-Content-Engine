# Correção: “Não foi possível identificar a publicação”

## Causa provável

O editor precisa ser aberto com o ID de um post existente, na rota `/carousel/{postId}`. Abrir apenas `/carousel` não informa a publicação a que o carrossel pertence. A geração usa `POST /posts/{post_id}/render/carousel`.

## Correção implementada

- Cada cartão do Pipeline tem um link **Editar carrossel** que abre `/carousel/{post.id}`.
- A geração é bloqueada se o ID estiver ausente ou inválido e apresenta uma mensagem explicativa.
- O editor mantém os textos e a ordem dos slides; as regras de 3 a 10 slides permanecem.

## Testar localmente

1. Atualize a branch de trabalho e reinicie frontend e backend.
2. Abra `http://localhost:5173/pipeline`.
3. Escolha um post existente e clique em **Editar carrossel**.
4. Confirme que a URL contém um ID numérico, por exemplo `/carousel/4` (use o ID real).
5. Confirme que há pelo menos três slides preenchidos e clique em **Gerar carrossel**.

## Diagnóstico se continuar falhando

### 1. Backend
Abra `http://localhost:8000/health`. Se não responder, inicie o backend e examine seu terminal.

### 2. Rota
Abra `http://localhost:8000/docs` e procure `POST /posts/{post_id}/render/carousel`. Se estiver ausente, o backend executado pode ser de uma versão antiga.

### 3. Resposta da API
Pressione F12, abra **Network/Rede**, tente gerar novamente e inspecione a requisição `/posts/ID/render/carousel`:
- `404`: ID de post inexistente ou rota não disponível.
- `401`: sessão/token expirado; entre novamente.
- `422`: dados inválidos, slide vazio ou quantidade fora dos limites.
- `500`: consulte o terminal do backend para a exceção.
- `200/201`: geração concluída; se a interface não mostrar os arquivos, verifique a resposta e os URLs dos assets.

### 4. Banco de dados
A rota procura o post no banco configurado no backend (`DATABASE_URL`). Se o post existe no Supabase mas não no banco que o backend local utiliza, a geração pode retornar 404. Confirme o arquivo de ambiente sem compartilhar credenciais em issues ou capturas de tela.

## Nota

Este ajuste corrige o fluxo de seleção/identificação do post. A persistência dos textos editados após atualizar a página ainda exige conectar o frontend/backend à tabela `public.carousel_slides`; consulte [o guia de integração](./integracao-frontend-slides-editaveis.md).
