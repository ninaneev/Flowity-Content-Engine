# Configuração do Supabase (Banco de Dados)

## O que é o Supabase?

O Supabase é um banco de dados PostgreSQL online **gratuito** com um painel visual bonito.
É como ter um banco de dados na nuvem sem precisar instalar nada.

---

## Passo 1 — Criar conta e projeto

1. Acesse **https://supabase.com**
2. Clique em **"Start your project"**
3. Faça login com GitHub
4. Clique em **"New project"**
5. Preencha:
   - **Name:** `flowity-content-engine`
   - **Database Password:** escolha uma senha forte e **salve ela** (vai precisar depois)
   - **Region:** `South America (São Paulo)` ou `East US`
6. Clique em **"Create new project"** e aguarde ~2 minutos

---

## Passo 2 — Obter a URL de conexão

1. No painel do Supabase, clique em **"Settings"** (ícone de engrenagem, menu lateral esquerdo)
2. Clique em **"Database"**
3. Role a página até **"Connection string"**
4. Selecione **"URI"**
5. Copie o valor — vai ser algo assim:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijkl.supabase.co:5432/postgres
   ```
6. Substitua `[YOUR-PASSWORD]` pela senha que você criou no Passo 1

---

## Passo 3 — Colar no arquivo .env

Abra o arquivo `.env` na raiz do projeto e cole a URL em `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.SEU_PROJETO.supabase.co:5432/postgres
```

---

## Passo 4 — Criar as tabelas (SQL)

1. No painel do Supabase, clique em **"SQL Editor"** no menu esquerdo
2. Clique em **"New query"**
3. Copie e cole **todo o bloco SQL abaixo**
4. Clique em **"Run"** (botão verde)
5. Deve aparecer "Success" em verde — as tabelas foram criadas!

```sql
-- ══════════════════════════════════════════════════════
--  Flowity Content Engine — Schema do banco de dados
--  Cole este SQL no Supabase SQL Editor e execute.
-- ══════════════════════════════════════════════════════

-- ── Tabela: sources ──────────────────────────────────
-- Guarda as referências de conteúdo da Flowity AI
CREATE TABLE IF NOT EXISTS sources (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    source_type VARCHAR(50)  NOT NULL
                CHECK (source_type IN (
                    'post_antigo', 'insight', 'frase', 'objecao',
                    'dor', 'trecho', 'comentario', 'newsletter', 'referencia'
                )),
    content     TEXT NOT NULL,
    theme       VARCHAR(100),
    audience    VARCHAR(100),
    origin      VARCHAR(255),
    tags_json   TEXT,          -- JSON array: '["ia","saas"]'
    notes       TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Tabela: posts ─────────────────────────────────────
-- Guarda os posts do calendário editorial
CREATE TABLE IF NOT EXISTS posts (
    id              SERIAL PRIMARY KEY,

    -- Conteúdo
    hook            VARCHAR(280) NOT NULL,
    body            TEXT,
    cta             VARCHAR(280),
    short_x         VARCHAR(280),
    alt_title       VARCHAR(280),

    -- Configurações
    channel         VARCHAR(20)  NOT NULL DEFAULT 'linkedin'
                    CHECK (channel IN ('linkedin', 'x')),
    tone            VARCHAR(50),
    objective       VARCHAR(100),
    format          VARCHAR(50),

    -- Status e datas
    status          VARCHAR(20) NOT NULL DEFAULT 'idea'
                    CHECK (status IN (
                        'idea', 'draft', 'revised', 'scheduled',
                        'publishing', 'published', 'failed'
                    )),
    scheduled_at    TIMESTAMP WITH TIME ZONE,
    published_at    TIMESTAMP WITH TIME ZONE,

    -- Metadados
    generation_mode VARCHAR(20),  -- 'template' | 'ollama' | 'manual'
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Tabela: post_sources ──────────────────────────────
-- Liga posts às sources que foram usadas para gerá-los
CREATE TABLE IF NOT EXISTS post_sources (
    id        SERIAL PRIMARY KEY,
    post_id   INTEGER NOT NULL REFERENCES posts(id)   ON DELETE CASCADE,
    source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    UNIQUE(post_id, source_id)  -- Evita duplicatas
);

-- ── Tabela: generation_runs ───────────────────────────
-- Histórico de cada geração (nunca apagar — são ativos valiosos)
CREATE TABLE IF NOT EXISTS generation_runs (
    id             SERIAL PRIMARY KEY,
    post_id        INTEGER REFERENCES posts(id) ON DELETE SET NULL,

    -- Input da geração
    prompt_used    TEXT,
    model_used     VARCHAR(100),
    mode           VARCHAR(20) NOT NULL DEFAULT 'template',

    -- Output bruto
    raw_output     TEXT,

    -- Output parseado
    parsed_hook    VARCHAR(280),
    parsed_body    TEXT,
    parsed_cta     VARCHAR(280),
    parsed_short_x VARCHAR(280),

    -- Métricas
    token_estimate INTEGER,
    status         VARCHAR(20) NOT NULL DEFAULT 'complete',
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Índices para melhorar a performance ───────────────
CREATE INDEX IF NOT EXISTS idx_posts_status       ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_channel      ON posts(channel);
CREATE INDEX IF NOT EXISTS idx_post_sources_post  ON post_sources(post_id);
CREATE INDEX IF NOT EXISTS idx_post_sources_source ON post_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_gen_runs_post      ON generation_runs(post_id);

-- ── Trigger para atualizar updated_at automaticamente ─
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sources_updated_at
    BEFORE UPDATE ON sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Dados de exemplo (opcional — remova se não quiser) ─
INSERT INTO sources (title, source_type, content, theme, origin) VALUES
(
    'Por que a maioria das empresas falha com IA',
    'insight',
    'Empresas tentam implementar IA sem antes mapear seus processos. O resultado é automação do caos. A ordem certa: processo → pessoas → tecnologia. IA amplifica o que já existe — se o processo é ruim, fica pior e mais rápido.',
    'automação',
    'experiência própria'
),
(
    'Frase de posicionamento Flowity AI',
    'frase',
    'A Flowity AI não vende tecnologia. Vende tempo de volta para founders que perderam o controle da operação. Cada automação que entregamos é uma hora por dia que o cliente recupera.',
    'posicionamento',
    'site flowity.ai'
);
```

---

## Verificar se funcionou

Após executar o SQL:
1. Clique em **"Table Editor"** no menu esquerdo do Supabase
2. Você deve ver as tabelas: `sources`, `posts`, `post_sources`, `generation_runs`
3. Clique em `sources` — deve ter 2 linhas de exemplo

---

## Problema: a API não consegue conectar

Se o backend der erro de conexão:
1. Verifique se a senha na `DATABASE_URL` do `.env` está correta
2. Verifique se o projeto Supabase está ativo (não pausado — free tier pausa após 1 semana sem uso)
3. No Supabase: **Settings → Database → Connection Pooling** — copie a URL "Transaction" se a direta não funcionar
