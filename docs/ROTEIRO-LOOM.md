# Roteiro Loom — demonstração do Flowity Content Engine

Duração alvo: 6 a 7 minutos. Resolução 1440x900, aba única em http://localhost:5173, login admin.

## Antes de gravar (checklist)

1. Docker Desktop aberto e os containers de pé (`docker compose up`).
2. Estado conhecido em 27/10/2026: o login funciona, mas a lista de posts dá erro 500 no banco real
   porque faltam as tabelas novas (`post_assets`, `post_metrics`, `alert_settings`) no Supabase. Sem
   rodar a migração, Pipeline, Analytics e Carrossel não abrem. Rode a migração antes de gravar.
3. Confirme que a branch em uso é a `main` atualizada (a branch local `feat/pi2-t11-teclado-leitor-tela`
   tinha um erro de código em `CarouselPage.jsx` que derruba o frontend inteiro).
4. Feche abas com dados pessoais. Treine uma vez sem gravar.

## Roteiro

Cada passo tem: o que clicar, o que falar (texto falado) e a legenda de tela (texto curto para o
vídeo, separado da fala).

### 1. Abertura (0:00 a 0:30)
- Clicar: tela de login. Entrar com admin.
- Falar: "Oi, eu sou a Nina. Vou mostrar o Flowity Content Engine, a plataforma que uso para planejar,
  escrever e publicar meus posts no LinkedIn e no X, com uma pessoa aprovando cada passo."
- Legenda: Flowity Content Engine — projeto integrador Univesp.

### 2. Calendário (0:30 a 1:15)
- Clicar: menu Calendar. Passar o mouse num post agendado.
- Falar: "Aqui está o calendário editorial do mês. Só aparecem os posts agendados. O fluxo é: ideia,
  rascunho, revisado, agendado, publicado."
- Legenda: Calendário editorial e fluxo de aprovação.

### 3. Biblioteca (1:15 a 1:50)
- Clicar: Library. Abrir uma referência.
- Falar: "A biblioteca guarda as referências que alimentam os posts: insights, notas, dados."
- Legenda: Biblioteca de referências.

### 4. Generator (1:50 a 2:50)
- Clicar: Generator. Escolher até 3 referências, canal LinkedIn, tom, modo template. Gerar. Salvar
  como rascunho.
- Falar: "Escolho até três referências, defino canal e tom e a plataforma gera o rascunho, com IA local
  ou template. Nada é publicado sozinho: vira rascunho para eu revisar."
- Legenda: Geração de conteúdo a partir de referências.

### 5. Pipeline e revisão (2:50 a 3:50)
- Clicar: Pipeline. Abrir o rascunho. Mostrar hook, corpo, CTA, versão para X. Rolar até
  "Imagens do post" e mostrar o texto alternativo obrigatório.
- Falar: "O pipeline mostra cada post na sua etapa. No modal eu edito e aprovo. Toda imagem exige texto
  alternativo, para quem usa leitor de tela. Sem a descrição, o botão de salvar fica desabilitado."
- Legenda: Revisão e acessibilidade (texto alternativo obrigatório).

### 6. Carrossel (3:50 a 5:00)
- Clicar: Carrossel (ou o post no Pipeline). Editar um slide, mover um slide, clicar em Gerar
  carrossel. Mostrar as miniaturas, Baixar PDF e o checklist.
- Falar: "Para o LinkedIn eu monto um carrossel de 3 a 10 slides. A plataforma gera as imagens e um PDF
  pronto para subir, e um checklist confirma se está tudo certo antes de publicar."
- Legenda: Carrossel do LinkedIn com PDF e checklist.

### 7. Analytics e alertas (5:00 a 6:00)
- Clicar: Analytics. Mostrar números gerais, dia da semana, LinkedIn x X. Depois Settings e o limite
  de engajamento.
- Falar: "Depois de publicar, registro as métricas e o painel mostra em que dia rende mais e qual rede
  funciona melhor. Se um post fica abaixo do limite que eu defini, ele aparece no alerta."
- Legenda: Análise de desempenho e alerta de engajamento.

### 8. Fechamento (6:00 a 6:30)
- Falar: "É isso. Ideia, rascunho, revisão humana, carrossel, publicação e análise num fluxo só. Se
  quiser ver mais, me chama."
- Legenda: Flowity AI.

## Onde está hospedado

Estado hoje: não está hospedado publicamente. Evidências: o único projeto Flowity na Vercel da conta é
o `flowity-executive-hub` (outro produto); não há URL do Render nem da Vercel no README ou nos docs
(só exemplos em `infra/deploy/README.md`). O app roda só por Docker na máquina da Nina
(frontend 5173, backend 8000, Ollama 11434, n8n 5678). O banco, sim, está na nuvem: Supabase
(PostgreSQL).

O repositório já traz a configuração pronta para publicar: `render.yaml` (backend FastAPI no Render,
com disco persistente), `frontend/vercel.json` (frontend Vite na Vercel) e o passo a passo em
`infra/deploy/README.md`.

### Recomendação

Frontend na Vercel, backend no Render, banco no Supabase (o que o repositório já prevê).

Passos concretos:

1. Banco: rodar a migração no Supabase (`alembic upgrade head`, com a regra de `alembic stamp` do
   passo 4.3 do `infra/deploy/README.md`, porque o banco veio do PI 1 sem Alembic). É também o que
   conserta o erro 500 de hoje. Fazer backup antes.
2. Backend no Render: New, Blueprint, apontar para o repo, preencher `DATABASE_URL` (Session pooler
   do Supabase, com `?sslmode=require`), `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` e `CORS_ORIGINS`.
3. Frontend na Vercel: importar o repo com Root Directory `frontend` e variável `VITE_API_URL` com a URL
   do Render, sem barra no final. Depois colocar a URL da Vercel em `CORS_ORIGINS` no Render.
   Pelo Vercel MCP já conectado dá para criar o projeto e as variáveis (`create_project`,
   `create_project_env`, `create_deployment`); a Nina só precisa autorizar o GitHub.
4. Alternativa de frontend: Netlify (publish dir `dist`, comando `npm run build`, regra de
   redirecionamento `/* /index.html 200`). Alternativa de backend: Railway (Dockerfile em `backend/`,
   volume para as mídias); mais simples de começar, mas cobra por uso.

### Limites, sem enfeitar

- Render gratuito: o serviço dorme após cerca de 15 minutos sem uso (primeira abertura demora) e não
  tem disco persistente nem etapa de migração; as imagens enviadas somem a cada reinício. O
  `render.yaml` pede o plano Starter (cerca de US$ 7 por mês) por isso.
- Vercel Hobby é para uso não comercial; se virar ferramenta comercial da Flowity, pede plano Pro.
- Supabase gratuito pausa o projeto após cerca de uma semana sem atividade (erro "tenant not found").
  A branch `feat/supabase-keepalive` existe para isso e ainda não foi mesclada.
- O Ollama (IA local) não vai para a nuvem junto: no ar o Generator cai no modo template, a menos que
  se configure outro provedor de IA.
- O n8n (publicação automática) também roda local; na nuvem precisaria de hospedagem própria.
