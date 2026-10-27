# Diagnóstico: “Não foi possível identificar a publicação”

## Causa

O editor precisa receber o ID de uma publicação existente. A rota correta é `/carousel/{postId}`; abrir apenas `/carousel` não identifica qual post deve receber a geração.

## Correção no código

- O Pipeline exibe **Editar carrossel** em cada post e abre `/carousel/{post.id}`.
- O editor valida o ID antes de chamar a geração e mostra uma instrução quando o ID não é válido.
- A geração mantém os limites de 3 a 10 slides e envia os textos atuais na ordem exibida.

## Como testar

1. Atualize a branch `feat/pi2-t11-teclado-leitor-tela`.
2. Reinicie frontend e backend seguindo o README do projeto.
3. Abra `http://localhost:5173/pipeline`.
4. Escolha um post e clique em **Editar carrossel**.
5. Confirme que a URL contém um ID real, por exemplo `/carousel/4`.
6. Preencha ao menos 3 slides e clique em **Gerar carrossel**.

## Se ainda falhar

1. Abra `http://localhost:8000/health` para verificar se o backend está ativo.
2. Abra `http://localhost:8000/docs` e procure a rota de geração `POST /posts/{post_id}/render/carousel`.
3. No navegador, pressione F12 → **Network/Rede**, tente gerar novamente e abra a resposta da requisição:
   - `404`: post inexistente ou rota ausente.
   - `401`: sessão expirada; entre novamente.
   - `422`: payload inválido ou slides fora das regras.
   - `500`: examine o terminal do backend para a exceção real.
4. Confirme que o backend usa a mesma base de dados em que o post existe. Não compartilhe chaves ou credenciais em issues.

## Observação

A correção de identificação não implementa sozinha a persistência dos textos no Supabase. Para manter alterações após atualizar a página, conclua o fluxo descrito em `docs/integracao-frontend-slides-editaveis.md`.
