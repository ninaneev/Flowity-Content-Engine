# Implantação em nuvem — Flowity Content Engine (PI 2, Tarefa 4)

Este documento registra **qual provedor foi escolhido e por quê** e traz o **passo a passo exato**
para publicar a aplicação. Os arquivos de configuração já estão no repositório; o que depende de
conta, senha ou clique em painel está marcado com **[VOCÊ FAZ]**.

## 1. Arquitetura publicada

```
 navegador ──> Vercel (frontend React+Vite, arquivos estáticos)
                  │  VITE_API_URL (definida no build)
                  ▼
              Render (backend FastAPI em Docker) ── disco persistente /var/data (mídia)
                  │  DATABASE_URL
                  ▼
              Supabase (PostgreSQL gerenciado, o mesmo banco do PI 1)
```

| Parte | Onde | Arquivo de configuração |
|-------|------|-------------------------|
| Backend (FastAPI) | Render, serviço web Docker | `render.yaml` (raiz) + `backend/Dockerfile` |
| Frontend (React + Vite) | Vercel | `frontend/vercel.json` |
| Banco | Supabase PostgreSQL (já existente) | só a variável `DATABASE_URL` |
| Mídia (imagens) | Disco persistente do Render em `/var/data` | `render.yaml` → `disk` + `MEDIA_DIR` |
| Ensaio local de produção | Docker Compose | `docker-compose.prod.yml` |

## 2. Por que este provedor (justificativa para o Relatório Final)

Comparamos três opções para o backend. **Valores de referência: confira os preços nos sites no dia
da implantação e anote a data no relatório**, porque planos gratuitos mudam com frequência.

| Critério | Render | Railway | Fly.io |
|----------|--------|---------|--------|
| Deploy a partir do GitHub com Dockerfile | Sim, por Blueprint (`render.yaml`) versionado | Sim | Sim, via CLI `flyctl` |
| Plano gratuito | Existe, mas o serviço "dorme" após ~15 min sem uso, **sem disco persistente** e sem etapa de release | Crédito de teste; depois plano pago por uso | Sem plano gratuito para contas novas |
| Disco persistente | Sim, no plano pago (Starter, ~US$ 7/mês + ~US$ 0,25/GB/mês) | Sim (volumes) | Sim (volumes) |
| Etapa de release (migração antes de subir) | `preDeployCommand` (plano pago) | Comando de pre-deploy | `release_command` |
| Infra como código no repositório | `render.yaml` | `railway.json` (parcial) | `fly.toml` |
| Curva de aprendizado para a equipe | Baixa (painel + arquivo único) | Baixa | Média (CLI obrigatória) |

**Escolha: Render (backend) + Vercel (frontend) + Supabase (banco).**

- O **Render** atende aos dois requisitos que a banca vai verificar — mídia que sobrevive a reinício
  (disco persistente) e migração como etapa de release (`preDeployCommand`) — com toda a configuração
  num arquivo versionado (`render.yaml`), que qualquer integrante consegue ler e revisar.
- A **Vercel** serve o frontend estático com CDN e HTTPS sem custo no plano Hobby, e separa o deploy
  do frontend do backend.
- O **Supabase** já guarda os dados do PI 1; manter o mesmo banco evita migração de dados.

**Custo e limitação declarada:** o disco persistente e o `preDeployCommand` só existem no plano pago
do Render (Starter). No plano gratuito a aplicação até sobe, mas **as imagens somem a cada reinício ou
deploy** e a migração teria de ser rodada à mão — o que não cumpre a DoD. Se a equipe não puder pagar
o Starter, registre isso no relatório como limitação, em vez de declarar a DoD cumprida.

**Plano Hobby da Vercel:** é destinado a uso não comercial. Para o projeto acadêmico serve; se a
ferramenta passar a uso comercial da Flowity AI, é preciso o plano Pro.

**Trabalho futuro (não implementado agora):** trocar o disco local por armazenamento de objetos
(S3, Cloudflare R2 ou Supabase Storage) atrás de uma interface `Storage`. Isso permitiria mais de uma
instância do backend e deploy sem janela de indisponibilidade (com disco, o Render faz deploy com
uma pequena interrupção, porque o disco só se liga a uma instância por vez).

## 3. Variáveis de ambiente

Nenhum valor real vai para o repositório. Os valores são colados nos painéis do Render e da Vercel.

### Backend (Render)

| Variável | Obrigatória | Exemplo / origem |
|----------|-------------|------------------|
| `DATABASE_URL` | Sim | Supabase → pooler, modo sessão (ver passo 4.1) |
| `JWT_SECRET` | Sim | Gerada automaticamente pelo Blueprint (`generateValue`) |
| `JWT_EXPIRY_HOURS` | Não | `24` |
| `ADMIN_USERNAME` | Sim | `admin` (ou outro) |
| `ADMIN_PASSWORD_HASH` | Sim | hash bcrypt da senha (ver passo 4.2) |
| `CORS_ORIGINS` | Sim | `https://flowity-content-engine.vercel.app` — só a URL do frontend, sem `/` no final; várias separadas por vírgula |
| `CORS_ALLOW_PRIVATE_NETWORK` | Sim | `false` em produção (no desenvolvimento o padrão é `true`) |
| `MEDIA_DIR` | Sim | `/var/data/media` (dentro do disco persistente) |
| `N8N_WEBHOOK_SECRET` | Sim | Gerada pelo Blueprint; copie para o n8n se ele for usado |
| `OLLAMA_BASE_URL` | Não | `http://127.0.0.1:11434` (inalcançável de propósito — ver limitações) |
| `DEBUG` | Não | `false` |

### Frontend (Vercel)

| Variável | Obrigatória | Exemplo |
|----------|-------------|---------|
| `VITE_API_URL` | Sim | `https://flowity-content-engine-api.onrender.com` (URL do Render, sem `/` no final) |

`VITE_API_URL` é lida **no momento do build**. Se mudar o valor, é preciso fazer um novo deploy na
Vercel para ele valer.

## 4. Passo a passo

### 4.1 [VOCÊ FAZ] Pegar a `DATABASE_URL` do Supabase

1. Supabase → seu projeto → botão **Connect** (topo da página).
2. Escolha **Session pooler** (não use "Direct connection": ela usa IPv6 e o Render só sai por IPv4).
3. Copie a URI. O formato é:
   `postgresql://postgres.<ref-do-projeto>:<SENHA>@aws-0-<regiao>.pooler.supabase.com:5432/postgres`
4. Troque `<SENHA>` pela senha do banco. Se a senha tiver `@`, `#`, `/` ou `%`, codifique
   (ex.: `@` vira `%40`) ou redefina a senha só com letras e números.
5. Acrescente `?sslmode=require` no final.

### 4.2 [VOCÊ FAZ] Gerar o hash da senha do admin

Na sua máquina, dentro de `backend/` com as dependências instaladas:

```bash
python -c "import bcrypt; print(bcrypt.hashpw(b'SUA_SENHA_AQUI', bcrypt.gensalt()).decode())"
```

Guarde a senha num gerenciador de senhas; cole só o hash no Render.

### 4.3 [VOCÊ FAZ] Conferir o estado das migrações no Supabase (uma vez só)

O banco do PI 1 foi criado pelo SQL de `PI1/supabase-setup.md` e pelo `create_tables()` da API,
não pelo Alembic. Antes do primeiro deploy, rode **na sua máquina**, com a `DATABASE_URL` do passo
4.1 no seu arquivo de ambiente local:

```bash
cd backend
alembic current        # mostra a revisão aplicada (vazio = Alembic nunca rodou nesse banco)
alembic heads          # mostra a revisão mais nova do repositório
```

- Se `alembic current` vier vazio **e as tabelas novas do PI 2 (`post_assets`, `post_metrics`)
  ainda não existirem** no Supabase (Table Editor): nada a fazer, o deploy aplica tudo.
- Se vier vazio **mas alguma delas já existir** (criada pelo `create_tables()` em algum teste
  apontado para o Supabase): marque como aplicada a última revisão cuja tabela já existe, para o
  Alembic não tentar criá-la de novo — `alembic stamp <id_da_revisao>` (o id está no topo de cada
  arquivo em `backend/alembic/versions/`). Depois `alembic upgrade head` aplica só o que falta.

### 4.4 [VOCÊ FAZ] Criar o backend no Render

1. Crie a conta em https://render.com entrando com o GitHub.
2. **New → Blueprint** → autorize o Render a ler `ninaneev/Flowity-Content-Engine` → selecione o repo.
   O Render lê o `render.yaml` da raiz e mostra o serviço `flowity-content-engine-api`
   (Docker, plano Starter, disco de 1 GB em `/var/data`).
3. Ele pede as variáveis marcadas como `sync: false`. Cole:
   - `DATABASE_URL` → valor do passo 4.1
   - `ADMIN_USERNAME` → `admin`
   - `ADMIN_PASSWORD_HASH` → valor do passo 4.2
   - `CORS_ORIGINS` → por enquanto `https://example.com` (volta aqui no passo 4.6)
4. Confirme (**Apply**). Informe o cartão quando pedir (plano Starter).
5. Acompanhe em **Events/Logs**: primeiro o build da imagem, depois o
   `preDeployCommand: alembic upgrade head`, depois o start. Se a migração falhar, o deploy para e
   nada muda no ar — leia o log, corrija e clique **Manual Deploy**.
6. Anote a URL pública, ex.: `https://flowity-content-engine-api.onrender.com`.

Comando exato de migração usado no provedor (para o relatório): `alembic upgrade head`, configurado
como `preDeployCommand` no `render.yaml`, executado no diretório `/app` da imagem Docker do backend.

### 4.5 [VOCÊ FAZ] Criar o frontend na Vercel

1. Crie a conta em https://vercel.com entrando com o GitHub.
2. **Add New → Project** → importe `ninaneev/Flowity-Content-Engine`.
3. Em **Root Directory**, escolha `frontend`. O framework (Vite) e os comandos vêm do
   `frontend/vercel.json`.
4. Em **Environment Variables**, adicione `VITE_API_URL` = URL do Render do passo 4.4
   (marque Production e Preview).
5. **Deploy**. Anote a URL, ex.: `https://flowity-content-engine.vercel.app`.

### 4.6 [VOCÊ FAZ] Fechar o CORS

1. Render → serviço → **Environment** → edite `CORS_ORIGINS` para a URL exata da Vercel do passo 4.5
   (com `https://`, sem `/` no final).
2. Salve; o Render reinicia o serviço.

Observação: URLs de *preview* da Vercel (uma por PR) ficam bloqueadas pelo CORS de propósito. Para
testar uma preview, acrescente a URL dela em `CORS_ORIGINS` separada por vírgula e depois remova.

### 4.7 [VOCÊ FAZ] Verificar (de outra rede — ex.: 4G do celular roteado)

```bash
API=https://flowity-content-engine-api.onrender.com

curl -i $API/health          # 3 vezes seguidas: HTTP 200 e {"status":"ok",...}
curl -i $API/docs            # HTTP 200 (Swagger)

# CORS: a origem publicada é aceita...
curl -i -X OPTIONS $API/auth/login \
  -H "Origin: https://flowity-content-engine.vercel.app" \
  -H "Access-Control-Request-Method: POST"
#   -> access-control-allow-origin: https://flowity-content-engine.vercel.app
# ...e uma origem qualquer não recebe esse cabeçalho:
curl -i -X OPTIONS $API/auth/login \
  -H "Origin: https://site-qualquer.com" \
  -H "Access-Control-Request-Method: POST"
#   -> HTTP 400, sem access-control-allow-origin
```

No navegador, pela URL da Vercel: login → cadastrar um source → gerar um post → anexar/gerar uma
imagem do post (depende das Tarefas 5 e 7 estarem na `main`).

**Mídia persistente:** com uma imagem já gerada (ex.: `/media/posts/1/card.png`):

```bash
curl -I $API/media/posts/1/card.png      # HTTP 200
# Render → serviço → Manual Deploy → "Restart service" (ou um novo deploy)
curl -I $API/media/posts/1/card.png      # continua HTTP 200 depois do restart
```

**Segredos:** confira que nada vazou no histórico da branch:

```bash
git log -p origin/main..HEAD | grep -niE "supabase\.co|pooler|password|secret|jwt" 
# só podem aparecer nomes de variáveis e exemplos, nunca valores reais
```

Registre no relatório as URLs, a data, prints do `/health` e do teste de restart.

## 5. Ensaio local da configuração de produção

Para testar na sua máquina o mesmo fluxo do Render (migração antes, servidor sem `--reload`,
mídia em volume):

```bash
docker compose -f docker-compose.prod.yml up --build
```

E o build do frontend como a Vercel faz:

```bash
cd frontend
npm ci
VITE_API_URL=https://flowity-content-engine-api.onrender.com npm run build
```

## 6. Limitações conhecidas (declarar no relatório)

- **IA generativa:** o Ollama (`llama3.1:8b`) precisa de GPU/RAM que o plano Starter não tem, então
  ele **não** foi publicado. Em nuvem a geração usa o modo `template-fallback`. Rodar o Ollama em
  nuvem exigiria uma máquina com GPU ou uma API externa — fica como trabalho futuro.
- **n8n:** o workflow de publicação continua rodando localmente (Docker Compose). Para ele falar com
  a API publicada, aponte-o para a URL do Render e use o mesmo `N8N_WEBHOOK_SECRET`.
- **Uma instância só:** o disco persistente do Render se liga a uma única instância; não há escala
  horizontal nem deploy sem interrupção (ver "Trabalho futuro").
- **Tabelas criadas no startup:** a API ainda chama `create_tables()` ao iniciar (herança do PI 1).
  Como a migração roda antes, isso não recria nada, mas o ideal é que o esquema venha só do Alembic.
- **Região:** o Render não tem região no Brasil; o serviço fica em `virginia` (EUA). Se o projeto do
  Supabase estiver em `sa-east-1`, cada consulta atravessa o continente (latência de ~120 ms).
  Para o volume do projeto é aceitável; registre no relatório.
