# Tarefas dos Integrantes — PI 2 (Flowity Content Engine 2.0)

> Continuação de [`PI1/team-tasks.md`](../PI1/team-tasks.md). As tarefas do PI 1 continuam lá.
> Cada tarefa aqui é uma **issue** no GitHub, no projeto **Flowity Content Engine - PI 2**.
> Cada integrante trabalha numa **branch separada**. Toda alteração entra por **Pull Request**,
> aprovado pelo líder antes do merge em `main`.

- Repositório: https://github.com/ninaneev/Flowity-Content-Engine
- Quadro do PI 2: https://github.com/users/ninaneev/projects/4
- **São 16 tarefas, 2 por integrante.** As tarefas estão numeradas na ordem em que devem ser feitas.

---

## O que muda do PI 1 para o PI 2

No PI 1 o sistema gerava **texto**. No PI 2 ele passa a gerar a **peça completa**: texto, imagem única e
carrossel para o LinkedIn, com **acessibilidade obrigatória** (texto alternativo em toda imagem,
navegação por teclado, contraste conforme WCAG 2.1 AA, HTML semântico), rodando **em nuvem**, com
**análise de dados** das publicações e **testes automatizados**.

Documentos de apoio:

- [`PI2/perguntas-continuidade-pi1.md`](perguntas-continuidade-pi1.md) — o levantamento com a Flowity AI que originou este escopo
- [`PI2/referencias-bibliograficas.md`](referencias-bibliograficas.md) — bibliografia
- [`PI2/plano-de-acao-pi2-texto.md`](plano-de-acao-pi2-texto.md) — Plano de Ação e as 7 quinzenas

---

## Regras de trabalho (valem para todos)

1. **Uma issue = uma branch = um Pull Request.** O nome da branch está na própria tarefa.
2. **Nunca commitar direto na `main`.**
3. **Nunca commitar `.env` nem credencial.** Só o `.env.example`, com valores vazios.
4. **Todo PR fecha a issue** com a linha `Closes #<numero>` na descrição.
5. **Toda imagem precisa de texto alternativo.** Não é opcional em nenhuma tarefa do PI 2:
   é requisito legal (Lei nº 13.146/2015) e critério de aceitação.
6. **Comentar o andamento na issue** pelo menos uma vez por semana.
7. Antes de abrir o PR, rode a aplicação e confira que **nada do PI 1 quebrou**.

Fluxo padrão de qualquer tarefa:

```bash
git checkout main
git pull origin main
git checkout -b <branch-da-tarefa>
# ... trabalha ...
git add <arquivos>
git commit -m "feat: descricao curta em portugues"
git push origin <branch-da-tarefa>
# abre o Pull Request no GitHub com "Closes #<numero>"
```

Como subir o ambiente local:

```bash
docker compose up -d                                    # banco e serviços
cd backend && uvicorn app.main:app --reload --port 8000
cd frontend && npm install && npm run dev
```

Front-end em http://localhost:5173, documentação da API em http://localhost:8000/docs.
Se algo não subir, veja [`PI1/setup.md`](../PI1/setup.md).

---

## As 16 tarefas, na ordem de execução

| # | Tarefa | Integrante | Issue | Área | Depende de |
|---|--------|-----------|-------|------|-----------|
| 1 | Criar o modelo PostAsset | Davi Corrêa Bueno | [#79](https://github.com/ninaneev/Flowity-Content-Engine/issues/79) | Backend | — |
| 2 | Acessibilidade: foco, contraste, skip link | Pedro Luiz Simonetti Filho | [#87](https://github.com/ninaneev/Flowity-Content-Engine/issues/87) | Frontend | — |
| 3 | Criar o modelo PostMetric | João Maike Silva de Jesus | [#89](https://github.com/ninaneev/Flowity-Content-Engine/issues/89) | Backend | — |
| 4 | Publicar a aplicação em nuvem | Andrea Nina Maciel Cressoni | [#95](https://github.com/ninaneev/Flowity-Content-Engine/issues/95) | Infra | — |
| 5 | API de imagens do post | Jeferson Ferraz Ferreira | [#80](https://github.com/ninaneev/Flowity-Content-Engine/issues/80) | Backend | T1 |
| 6 | Texto alternativo obrigatório na API | Jeferson Ferraz Ferreira | [#83](https://github.com/ninaneev/Flowity-Content-Engine/issues/83) | Backend | T1 |
| 7 | Gerar a imagem única do post | Diego Gustavo Franco | [#81](https://github.com/ninaneev/Flowity-Content-Engine/issues/81) | Backend | T5 |
| 8 | Gerar o carrossel do LinkedIn | Davi Corrêa Bueno | [#82](https://github.com/ninaneev/Flowity-Content-Engine/issues/82) | Backend | T5, T7 |
| 9 | Enviar imagem no PostModal | Pedro Luiz Simonetti Filho | [#85](https://github.com/ninaneev/Flowity-Content-Engine/issues/85) | Frontend | T5 |
| 10 | Montar e pré-visualizar o carrossel | Roger Luiz de Paula | [#86](https://github.com/ninaneev/Flowity-Content-Engine/issues/86) | Frontend | T8, T9 |
| 11 | Teclado e leitor de tela no carrossel | Roger Luiz de Paula | [#88](https://github.com/ninaneev/Flowity-Content-Engine/issues/88) | Frontend | T10 |
| 12 | Baixar o carrossel em PDF | Tiago Antonio Ferreira | [#93](https://github.com/ninaneev/Flowity-Content-Engine/issues/93) | Frontend | T8, T10 |
| 13 | Painel de análise de dados | João Maike Silva de Jesus | [#90](https://github.com/ninaneev/Flowity-Content-Engine/issues/90) | Frontend | T3 |
| 14 | Alerta de engajamento baixo | Tiago Antonio Ferreira | [#91](https://github.com/ninaneev/Flowity-Content-Engine/issues/91) | Full-stack | T3 |
| 15 | Testes automatizados | Diego Gustavo Franco | [#96](https://github.com/ninaneev/Flowity-Content-Engine/issues/96) | Testes | T5, T6 |
| 16 | Medir o ganho de tempo | Andrea Nina Maciel Cressoni | [#94](https://github.com/ninaneev/Flowity-Content-Engine/issues/94) | Projeto | — |

Por integrante, duas tarefas cada:

| Integrante | Tarefas |
|---|---|
| Andrea Nina Maciel Cressoni | T4 (#95), T16 (#94) |
| Tiago Antonio Ferreira | T12 (#93), T14 (#91) |
| João Maike Silva de Jesus | T3 (#89), T13 (#90) |
| Davi Corrêa Bueno | T1 (#79), T8 (#82) |
| Pedro Luiz Simonetti Filho | T2 (#87), T9 (#85) |
| Roger Luiz de Paula | T10 (#86), T11 (#88) |
| Jeferson Ferraz Ferreira | T5 (#80), T6 (#83) |
| Diego Gustavo Franco | T7 (#81), T15 (#96) |

### Quem pode começar agora

As tarefas **1, 2, 3, 4 e 16** não dependem de ninguém e podem começar no mesmo dia.
As demais esperam a coluna "Depende de".

```
Semana 1   T1  T2  T3  T4          (base: modelo, acessibilidade, métricas, nuvem)
Semana 2   T5  T6  T9              (API de imagens e a tela de upload)
Semana 3   T7  T8  T13  T14        (renderização e análise de dados)
Semana 4   T10 T11 T12  T15        (carrossel na tela, teclado, download, testes)
Contínuo   T16                     (coleta de tempo nas quinzenas 4 a 6)
```

---

## Fora do escopo do PI 2

Duas necessidades reais ficaram de fora para o escopo caber no prazo. Entram no Relatório Final como
trabalho futuro, com a justificativa:

- **Busca e filtros avançados na biblioteca de Sources** (issue #92, encerrada) — necessidade
  registrada na Pergunta 3 de `perguntas-continuidade-pi1.md`.
- **Publicação automática direta na API do LinkedIn** — depende de aprovação de aplicativo junto à
  plataforma.

A documentação da API, que era uma tarefa separada (issue #84, encerrada), virou critério de aceitação
dentro da Tarefa 5.

---

## Tarefa 1 — Modelo PostAsset

| Campo | Valor |
|-------|-------|
| **Integrante** | Davi Corrêa Bueno |
| **Issue** | #79 |
| **Branch** | `feat/pi2-t01-modelo-post-asset` |
| **Área** | Backend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 3–4 horas |
| **Depende de** | nada |

### Por que esta tarefa existe
No PI 1 o post era só texto. Para um post ter imagem, o banco precisa de uma tabela que guarde cada arquivo, a ordem dele no carrossel e o texto alternativo. Esta tarefa cria essa base: as Tarefas 5, 6, 7 e 8 só começam depois dela.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t01-modelo-post-asset
```

**Passo 2 — Crie o modelo** `backend/app/models/post_asset.py`

Siga o padrão de `backend/app/models/post.py` (SQLAlchemy 2.0 com `Mapped` / `mapped_column`):

```python
class PostAsset(Base):
    """Cada linha é um arquivo de imagem pertencente a um post."""
    __tablename__ = "post_assets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True, nullable=False)
    kind: Mapped[str] = mapped_column(String(20), default="image", nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(50), nullable=False)
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
    size_bytes: Mapped[int | None] = mapped_column(Integer)
    alt_text: Mapped[str] = mapped_column(Text, nullable=False)
    caption: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now())

    post: Mapped["Post"] = relationship("Post", back_populates="assets")
```

`kind` aceita `image` ou `carousel_slide`. `alt_text` é `nullable=False` de propósito: o banco é a primeira barreira de acessibilidade.

**Passo 3 — Adicione o relacionamento em** `backend/app/models/post.py`

```python
    # ── Mídia (PI 2) ──────────────────────────────────────────────
    assets: Mapped[list["PostAsset"]] = relationship(
        "PostAsset", back_populates="post",
        order_by="PostAsset.position",
        cascade="all, delete-orphan", lazy="selectin")
```

Acrescente no topo do arquivo `from typing import TYPE_CHECKING` e, dentro do `if TYPE_CHECKING:`, `from app.models.post_asset import PostAsset`.

**Passo 4 — Registre o módulo em** `backend/app/db/database.py`

Dentro de `create_tables()`: `from app.models import source, post, generation, post_asset  # noqa: F401`

**Passo 5 — Prepare o Alembic (só se a pasta `backend/alembic/` ainda não existir)**

```bash
cd backend
pip install -r requirements.txt   # alembic==1.13.3 ja esta na lista
alembic init alembic
# em alembic/env.py:
#   from app.core.config import settings
#   from app.db.database import Base
#   from app.models import source, post, generation, post_asset  # noqa: F401
#   config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
#   target_metadata = Base.metadata
```

**Passo 6 — Crie a migração**

```bash
cd backend
alembic revision -m "cria tabela post_assets"
```

Renomeie o arquivo gerado para `alembic/versions/0001_criar_post_assets.py` e escreva `upgrade()` com `op.create_table("post_assets", ...)` (as 13 colunas do Passo 2, `alt_text` com `nullable=False`, FK para `posts.id` com `ondelete="CASCADE"`) e os índices `ix_post_assets_post_id` e `ix_post_assets_post_position`. O `downgrade()` derruba os dois índices e a tabela.

**Passo 7 — Aplique e confira**

```bash
cd backend
alembic upgrade head
alembic downgrade -1
alembic upgrade head
python -c "import sqlite3; c=sqlite3.connect('flowity.db'); print(c.execute('PRAGMA table_info(post_assets)').fetchall())"
```

**Passo 8 — Commite e abra o PR**
```bash
git add backend/app/models/post_asset.py backend/app/models/post.py backend/app/db/database.py backend/alembic.ini backend/alembic/
git commit -m "feat: criar modelo PostAsset e migracao da tabela post_assets"
git push origin feat/pi2-t01-modelo-post-asset
# Abra PR no GitHub: Closes #79
```

### Definition of Done ✅
- [ ] `backend/app/models/post_asset.py` criado com as 13 colunas e `alt_text` obrigatório
- [ ] `Post.assets` declarado com `order_by="PostAsset.position"` e `cascade="all, delete-orphan"`
- [ ] `create_tables()` importa `post_asset`
- [ ] `alembic upgrade head`, `downgrade -1` e `upgrade head` rodam sem erro
- [ ] `GET /posts/` continua respondendo 200
- [ ] PR aberto com `Closes #79` na descrição

---

## Tarefa 2 — Acessibilidade da aplicação

| Campo | Valor |
|-------|-------|
| **Integrante** | Pedro Luiz Simonetti Filho |
| **Issue** | #87 |
| **Branch** | `feat/pi2-t02-acessibilidade` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–6 horas |
| **Depende de** | nada |

### Por que esta tarefa existe
O PI 1 deixou dívidas de acessibilidade: `div` clicáveis no lugar de botões, nenhum landmark, foco de teclado invisível e dois tokens de cor reprovados no contraste. Esta tarefa faz cinco correções fechadas, nada além delas, e mede o resultado no axe DevTools.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t02-acessibilidade
```

**Passo 2 — Rode a auditoria ANTES**

Suba o frontend (`cd frontend && npm install && npm run dev`), instale a extensão axe DevTools no Chrome e rode "Scan ALL of my page" em `/` e `/sources`. Salve as capturas em `PI2/evidencias/antes-*.png` e anote o número de violações.

**Passo 3 — Correção 1: `button` no lugar da `div` clicável**

Em `frontend/src/components/calendar/CalendarDayCell.jsx`, o botão de adicionar post precisa ser um elemento real:

```jsx
<button
  type="button"
  onClick={() => onAddPost(day)}
  className="btn-ghost p-1 opacity-60 focus-visible:opacity-100 group-hover:opacity-100 transition-opacity"
  aria-label={`Criar post em ${day.toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric" })}`}
>
  <Plus size={12} aria-hidden="true" />
</button>
```

Regra geral: se navega, é `<a>`; se executa ação, é `<button type="button">`. Nunca `div` com `onClick`.

**Passo 4 — Correções 2 e 3: landmarks e skip link no `AppShell.jsx`**

Em `frontend/src/components/layout/AppShell.jsx`:

```jsx
<a href="#conteudo-principal" className="skip-link">
  Pular para o conteúdo principal
</a>
```

O skip link é o primeiro elemento focável da página. Envolva o topo da barra lateral em `<header>`, a lista de links em `<nav aria-label="Navegação principal">` e o conteúdo em `<main id="conteudo-principal" tabIndex={-1}>`.

**Passo 5 — Correção 4: anel de foco em `frontend/src/styles/theme.css`**

```css
:focus-visible {
  outline: 2px solid #1CD8DE;   /* ciano da marca, 11,35:1 sobre #07080F */
  outline-offset: 2px;
}
:focus:not(:focus-visible) { outline: none; }

.skip-link {
  position: absolute; left: -9999px; top: 0; z-index: 100;
  padding: 0.625rem 1rem; border-radius: 0 0 8px 0;
  background: var(--color-cyan); color: #07080F;
  font-size: 0.875rem; font-weight: 600; text-decoration: none;
}
.skip-link:focus, .skip-link:focus-visible {
  left: 0; outline: 2px solid #F0F2FF; outline-offset: 2px;
}
```

**Passo 6 — Correção 5: os dois contrastes reprovados**

Sobre o fundo real do projeto, `#07080F`:

| Onde | Antes | Contraste | Depois | Contraste |
|------|-------|-----------|--------|-----------|
| `text.muted` (`tailwind.config.js`) | `#5C6A82` | 3,66:1 reprova | `#7C8AA3` | 5,70:1 aprova |
| texto do `.btn-primary` (`theme.css`) | `#FFFFFF` | 1,76:1 no ciano | `#07080F` | 11,35:1 no ciano |

Troque `muted: "#5C6A82"` por `muted: "#7C8AA3"` em `tailwind.config.js` e, no bloco `.btn-primary` do `theme.css`, `color: #07080F;` no lugar de `text-white`.

**Passo 7 — Rode a auditoria DEPOIS e teste sem mouse**

Rode o axe DevTools de novo em `/` e `/sources`, salve em `PI2/evidencias/depois-*.png`. Carregue `/`, aperte Tab uma vez: o skip link precisa aparecer no canto superior esquerdo; aperte Enter e o foco vai para o `<main>`.

**Passo 8 — Commite e abra o PR**
```bash
git add frontend/tailwind.config.js frontend/src/styles/theme.css frontend/src/components/layout/AppShell.jsx frontend/src/components/calendar/CalendarDayCell.jsx PI2/evidencias/
git commit -m "feat: acessibilidade com foco visivel, contraste, skip link e HTML semantico"
git push origin feat/pi2-t02-acessibilidade
# Abra PR no GitHub: Closes #87
```

### Definition of Done ✅
- [ ] A `div` clicável do `CalendarDayCell.jsx` virou `<button type="button">` com `aria-label`
- [ ] `AppShell.jsx` tem `header`, `nav` com `aria-label` e `main` com `id="conteudo-principal"`
- [ ] Skip link invisível por padrão e visível ao receber foco pelo teclado
- [ ] `:focus-visible` com contorno de 2px em `#1CD8DE` no `theme.css`
- [ ] `text.muted` = `#7C8AA3` e texto do `.btn-primary` = `#07080F`
- [ ] Capturas do axe DevTools antes e depois anexadas no PR, com 0 violações críticas
- [ ] PR aberto com `Closes #87` na descrição

---

## Tarefa 3 — Modelo PostMetric

| Campo | Valor |
|-------|-------|
| **Integrante** | João Maike Silva de Jesus |
| **Issue** | #89 |
| **Branch** | `feat/pi2-t03-modelo-post-metric` |
| **Área** | Backend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 3–4 horas |
| **Depende de** | nada |

### Por que esta tarefa existe
O sistema guarda o conteúdo do post, mas nunca o resultado dele depois de publicado. Sem impressões, curtidas, comentários e compartilhamentos não há dado para relatório nem para dashboard. Esta tarefa cria a tabela `post_metrics` e dois endpoints: um para registrar os números na mão e outro para ler o resumo.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t03-modelo-post-metric
```

**Passo 2 — Crie o modelo** `backend/app/models/post_metric.py`

```python
class PostMetric(Base):
    """Cada linha é uma coleta de métricas de um post em uma plataforma."""
    __tablename__ = "post_metrics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True, nullable=False)
    platform: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    likes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    comments: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    shares: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    collected_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(20), default="manual", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    post: Mapped["Post"] = relationship("Post", back_populates="metrics")

    @property
    def engagement_rate(self) -> float:
        if not self.impressions:
            return 0.0
        return (self.likes + self.comments + self.shares) / self.impressions
```

`platform` aceita `linkedin` ou `x`, `source` aceita `manual` ou `import`. Acrescente o relacionamento `Post.metrics` em `backend/app/models/post.py` (mesmo padrão do `Post.assets`) e registre `post_metric` no `create_tables()`.

**Passo 3 — Crie os schemas** `backend/app/schemas/metric.py`

Pydantic v2. `MetricCreate` tem `platform: str` (com `field_validator` recusando o que não for `linkedin` ou `x`), os cinco contadores como `int = Field(default=0, ge=0)` (`impressions`, `likes`, `comments`, `shares`, `clicks`), `collected_at: datetime` e `source: str = "manual"`. `MetricResponse` herda dele, acrescenta `id`, `post_id`, `engagement_rate` e `created_at`, e leva `model_config = {"from_attributes": True}`.

Para o resumo, crie `ResumoPlataforma` (`platform`, `posts`, `impressions`, `engagement_rate`) e `MetricsSummary` (`total_publicados: int`, `engagement_rate: float` com a média do período e `por_plataforma: list[ResumoPlataforma]`).

**Passo 4 — Crie o repositório** `backend/app/repositories/metrics.py`

As rotas nunca fazem query direta, igual a `repositories/posts.py`. Escreva `create(db, post_id, data)` e `get_summary(db)`. No resumo, use sempre a coleta mais recente de cada post por plataforma (coletas antigas do mesmo post inflariam a média) e agregue em Python, não em SQL: o projeto roda em SQLite no desenvolvimento e em PostgreSQL em produção.

**Passo 5 — Crie as rotas** `backend/app/routes/metrics.py`

Duas rotas, as duas com `Depends(get_current_admin)`, igual ao resto da API:

```python
@router.post("/posts/{post_id}/metrics", response_model=MetricResponse,
             status_code=201, tags=["Metrics"])
def registrar_metrica(post_id: int, data: MetricCreate, db=Depends(get_db),
                      _admin=Depends(get_current_admin)):
    """Registro manual dos números lidos no LinkedIn ou no X."""
    if not post_repo.get_by_id(db, post_id):  # 404 se o post nao existe
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return metric_repo.create(db, post_id, data)

@router.get("/metrics/summary", response_model=MetricsSummary, tags=["Metrics"])
def resumo_metricas(db=Depends(get_db), _admin=Depends(get_current_admin)):
    return metric_repo.get_summary(db)
```

Em `backend/app/main.py`, importe `metrics` e registre: `app.include_router(metrics.router, prefix="", tags=["Metrics"])`.

**Passo 6 — Crie a migração e teste**

```bash
cd backend && alembic revision -m "cria tabela post_metrics"
# renomeie o arquivo gerado para 0006_criar_post_metrics.py e escreva upgrade/downgrade
alembic upgrade head && docker compose up backend
# no Swagger http://localhost:8000/docs: POST /posts/1/metrics, depois GET /metrics/summary
```

**Passo 7 — Commite e abra o PR**
```bash
git add backend/app/models/post_metric.py backend/app/models/post.py backend/app/schemas/metric.py backend/app/repositories/metrics.py backend/app/routes/metrics.py backend/app/main.py backend/app/db/database.py backend/alembic/
git commit -m "feat: criar modelo PostMetric e registro manual de metricas"
git push origin feat/pi2-t03-modelo-post-metric
# Abra PR no GitHub: Closes #89
```

### Definition of Done ✅
- [ ] Tabela `post_metrics` criada por migração Alembic que sobe e desce sem erro
- [ ] `Post.metrics` com `cascade="all, delete-orphan"` e `order_by="PostMetric.collected_at"`
- [ ] `POST /posts/{id}/metrics` responde 201 e 404 quando o post não existe
- [ ] `GET /metrics/summary` devolve totais por plataforma e a taxa de engajamento média
- [ ] `platform` fora de `linkedin`/`x` é recusado com 422
- [ ] PR aberto com `Closes #89` na descrição

---

## Tarefa 4 — Implantação em nuvem

| Campo | Valor |
|-------|-------|
| **Integrante** | Andrea Nina Maciel Cressoni |
| **Issue** | #95 |
| **Branch** | `feat/pi2-t04-implantacao-nuvem` |
| **Área** | Infra |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 5–6 horas |
| **Depende de** | nada |

### Por que esta tarefa existe
No PI 1 a aplicação só rodava na máquina local, por Docker Compose, e ninguém de fora conseguiu usar o sistema. O PI 2 exige a aplicação publicada em nuvem, com banco gerenciado, configuração fora do repositório e mídia que sobrevive a um reinício do serviço.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t04-implantacao-nuvem
```

**Passo 2 — Escolha o provedor e registre a decisão**

Crie `infra/deploy/README.md` comparando pelo menos duas opções (por exemplo Render e Railway, as duas com PostgreSQL gerenciado). Registre custo, limite do plano gratuito, se o disco persiste e por que a opção foi escolhida. Essa justificativa entra no Relatório Final.

**Passo 3 — Tire a configuração do código**

Em `backend/app/core/config.py`, tudo vem do ambiente:

```python
class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./flowity.db"
    CORS_ORIGINS: str = "http://localhost:5173"
    MEDIA_DIR: str = "./media"
```

Atualize o `.env.example` com essas chaves e **valores vazios ou de exemplo**. Confirme que `.env` está no `.gitignore` antes de qualquer commit.

**Passo 4 — Torne a mídia persistente**

O sistema de arquivos do contêiner é efêmero: sem disco, toda imagem gerada some no próximo restart. Monte um disco ou volume do provedor no caminho de `MEDIA_DIR` e documente esse passo no `infra/deploy/README.md`. Um backend S3 atrás de uma interface `Storage` fica registrado no README como trabalho futuro — não implemente agora.

**Passo 5 — Suba o banco gerenciado e migre**

Crie o PostgreSQL gerenciado, aponte `DATABASE_URL` para ele e rode a migração como etapa de release, nunca no `startup` da aplicação:

```bash
alembic upgrade head
```

Anote no README o comando exato usado no provedor.

**Passo 6 — Restrinja o CORS e configure a URL da API**

O backend libera apenas a origem do frontend publicado, via `CORS_ORIGINS`. O frontend usa `VITE_API_URL` no build; nenhum `localhost` fixo no código.

**Passo 7 — Publique e teste de outra rede**

```bash
curl -i https://<dominio-publicado>/health
curl -i https://<dominio-publicado>/docs
# reinicie o servico no painel do provedor e repita:
curl -I https://<dominio-publicado>/media/posts/1/card.png   # espera-se HTTP 200
```

Teste também o fluxo pelo navegador: login, cadastro de source e geração de post.

**Passo 8 — Commite e abra o PR**
```bash
git add infra/ .env.example backend/app/core/config.py docker-compose.prod.yml
git commit -m "infra: publicar aplicacao em nuvem com banco gerenciado e midia persistente"
git push origin feat/pi2-t04-implantacao-nuvem
# Abra PR no GitHub: Closes #95
```

### Definition of Done ✅
- [ ] Aplicação acessível por URL pública (frontend e `/docs` do backend), testada de outra rede
- [ ] PostgreSQL gerenciado em uso, com `alembic upgrade head` aplicado como etapa de release
- [ ] Imagem em `/media/...` continua acessível depois de reiniciar o serviço
- [ ] `.env.example` atualizado e nenhum segredo versionado
- [ ] `CORS_ORIGINS` restrito à origem do frontend publicado
- [ ] `infra/deploy/README.md` com o procedimento completo e a justificativa do provedor
- [ ] PR aberto com `Closes #95` na descrição

---

## Tarefa 5 — API de imagens do post

| Campo | Valor |
|-------|-------|
| **Integrante** | Jeferson Ferraz Ferreira |
| **Issue** | #80 |
| **Branch** | `feat/pi2-t05-api-assets` |
| **Área** | Backend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–5 horas |
| **Depende de** | Tarefa 1 (issue #79) |

### Por que esta tarefa existe
A tabela `post_assets` existe, mas ainda não há nenhuma forma de colocar uma imagem dentro de um post. Esta tarefa entrega os cinco endpoints de mídia, que são a porta de entrada das Tarefas 6, 7 e 8. O `alt_text` já é exigido no próprio formulário de envio.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t05-api-assets
```

**Passo 2 — Configure o diretório de mídia** em `backend/app/core/config.py`

```python
    # ── Mídia (PI 2) ──────────────────────────────────────────────
    MEDIA_DIR: str = "./media"
    MEDIA_URL_PREFIX: str = "/media"
    MAX_UPLOAD_BYTES: int = 5 * 1024 * 1024  # 5 MB por arquivo
    ALLOWED_IMAGE_MIME: str = "image/png,image/jpeg,image/webp"
```

Acrescente `MEDIA_DIR=./media` ao `.env.example` e a linha `backend/media/` ao `.gitignore`.

**Passo 3 — Crie os schemas** `backend/app/schemas/post_asset.py`

`PostAssetResponse` espelha as colunas do modelo e acrescenta `url: str | None`, com `model_config = {"from_attributes": True}`. Além dele:

```python
class PostAssetUpdate(BaseModel):
    alt_text: str | None = None
    caption: str | None = None

class AssetOrderUpdate(BaseModel):
    asset_ids: list[int] = Field(..., min_length=1, description="IDs na ordem desejada")
```

**Passo 4 — Crie o repositório** `backend/app/repositories/post_assets.py`

Funções `create`, `list_by_post` (ordenado por `position`), `get_by_id`, `update`, `reorder` e `delete`, além de `next_position(db, post_id)`. As rotas nunca fazem query direta.

**Passo 5 — Crie o router** `backend/app/routes/assets.py` com os cinco endpoints

```python
@router.post("/posts/{post_id}/assets", response_model=PostAssetResponse, status_code=201,
             summary="Envia uma imagem e anexa ao post")
async def upload_asset(post_id: int, file: UploadFile = File(...),
                       alt_text: str = Form(...), caption: str | None = Form(None),
                       kind: str = Form("image"), db=Depends(get_db),
                       _admin=Depends(get_current_admin)):
    if not post_repo.get_by_id(db, post_id):
        raise HTTPException(status_code=404, detail="Post não encontrado")
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail=f"Formato não suportado: {file.content_type}")
    conteudo = await file.read()
    if len(conteudo) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Arquivo maior que o limite de 5 MB")
```

Os outros quatro: `GET /posts/{post_id}/assets`, `PATCH /assets/{asset_id}`, `PUT /posts/{post_id}/assets/order` e `DELETE /assets/{asset_id}` (204, apaga também o arquivo no disco). Escreva dois helpers, `_media_root()` (cria e devolve `MEDIA_DIR` absoluto) e `_com_url(asset)` (preenche `url` a partir de `file_path`) — as Tarefas 7 e 8 reaproveitam os dois. O nome do arquivo salvo usa `uuid.uuid4().hex` mais a extensão do MIME, dentro de `posts/{post_id}/`.

**Passo 6 — Registre o router e sirva os arquivos** em `backend/app/main.py`

```python
app.include_router(assets.router, tags=["Media Assets"])

Path(settings.MEDIA_DIR).mkdir(parents=True, exist_ok=True)
app.mount(settings.MEDIA_URL_PREFIX,
          StaticFiles(directory=settings.MEDIA_DIR), name="media")
```

**Passo 7 — Teste os cinco endpoints**

```bash
docker compose up --build backend
# pegue o token em POST /auth/login e rode os 5 endpoints em http://localhost:8000/docs
```

Confira que a imagem enviada abre em `http://localhost:8000/media/posts/1/<arquivo>.png`.

**Passo 8 — Commite e abra o PR**
```bash
git add backend/app/schemas/post_asset.py backend/app/repositories/post_assets.py backend/app/routes/assets.py backend/app/core/config.py backend/app/main.py .gitignore .env.example
git commit -m "feat: api de imagens do post com envio, listagem, reordenacao e remocao"
git push origin feat/pi2-t05-api-assets
# Abra PR no GitHub: Closes #80
```

### Definition of Done ✅
- [ ] Os cinco endpoints respondem: envio (201), listagem, edição, reordenação e remoção (204)
- [ ] Arquivo fora de PNG/JPEG/WebP recusado com 415 e acima de 5 MB recusado com 413
- [ ] `MEDIA_DIR` montado com `StaticFiles`, imagem acessível por `/media/...`
- [ ] Todas as rotas novas aparecem em `/docs` com `summary` e `response_model` preenchidos
- [ ] Os erros seguem um formato único de resposta em todas as rotas novas
- [ ] `backend/media/` no `.gitignore`, nenhum arquivo de mídia versionado
- [ ] PR aberto com `Closes #80` na descrição

---

## Tarefa 6 — Texto alternativo obrigatório

| Campo | Valor |
|-------|-------|
| **Integrante** | Jeferson Ferraz Ferreira |
| **Issue** | #83 |
| **Branch** | `feat/pi2-t06-alt-text-obrigatorio` |
| **Área** | Backend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 3–4 horas |
| **Depende de** | Tarefa 1 (issue #79) |

### Por que esta tarefa existe
A Lei 13.146/2015 (artigo 63) exige que conteúdo digital seja acessível, e o eMAG, na recomendação 3.6, pede alternativa em texto para toda imagem. Aqui o `alt_text` deixa de ser um campo que apenas existe e passa a ser um campo validado: nenhum post com imagem sem descrição chega a `scheduled` ou `published`.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t06-alt-text-obrigatorio
```

**Passo 2 — Crie o serviço** `backend/app/services/accessibility.py`

Uma regra só, usada pelo schema e pelas rotas:

```python
ALT_MIN = 10
ALT_MAX = 300
TERMOS_GENERICOS = {
    "imagem", "imagens", "foto", "fotos", "figura", "print", "screenshot",
    "image", "images", "picture", "photo", "img", "banner", "slide", "post",
    "sem descricao", "sem descrição",
}

class AltTextInvalido(ValueError):
    """Levantado quando o texto alternativo não atende às regras."""

def validar_alt_text(valor: str | None) -> str:
    if valor is None:
        raise AltTextInvalido("O texto alternativo é obrigatório para toda imagem.")
    limpo = " ".join(valor.split())
    if len(limpo) < ALT_MIN or len(limpo) > ALT_MAX:
        raise AltTextInvalido(
            f"O texto alternativo precisa ter de {ALT_MIN} a {ALT_MAX} caracteres.")
    if limpo.strip(" .!-").lower() in TERMOS_GENERICOS:
        raise AltTextInvalido("Descreva o conteúdo da imagem, não use termos genéricos.")
    return limpo
```

Acrescente também `alt_text_valido(valor) -> bool`, a versão booleana usada na auditoria antes de publicar.

**Passo 3 — Aplique o validador nos schemas** `backend/app/schemas/post_asset.py`

```python
class PostAssetUpdate(BaseModel):
    alt_text: str | None = None
    caption: str | None = None

    @field_validator("alt_text")
    @classmethod
    def validate_alt_text(cls, v: str | None) -> str | None:
        if v is None:
            return v          # campo nao enviado no PATCH, mantem o valor atual
        return validar_alt_text(v)
```

Crie também `AltTextIn` com `alt_text: str = Field(..., min_length=ALT_MIN, max_length=ALT_MAX)` e o mesmo validador — ele valida o `alt_text` que chega por formulário multipart no upload.

**Passo 4 — Valide no upload**, em `backend/app/routes/assets.py`

Dentro de `upload_asset`, logo depois de conferir se o post existe, valide com `AltTextIn` e converta `AltTextInvalido` em `HTTPException(status_code=422, ...)`. Faça o mesmo no `PATCH /assets/{asset_id}`.

**Passo 5 — Crie a consulta de pendências** em `backend/app/repositories/post_assets.py`

`sem_alt_text_valido(db, post_id)` devolve a lista de assets do post cujo `alt_text` reprova em `alt_text_valido()`.

**Passo 6 — Bloqueie agendar e publicar**, em `backend/app/routes/posts.py`

```python
STATUS_QUE_EXIGEM_ACESSIBILIDADE = {"scheduled", "published"}

def _garantir_acessibilidade(db, post_id: int, novo_status: str | None) -> None:
    if novo_status not in STATUS_QUE_EXIGEM_ACESSIBILIDADE:
        return
    pendentes = asset_repo.sem_alt_text_valido(db, post_id)
    if pendentes:
        raise HTTPException(status_code=422, detail={"error": {
            "code": "acessibilidade_pendente",
            "message": f"{len(pendentes)} imagem(ns) sem texto alternativo válido.",
            "field": "assets.alt_text",
            "asset_ids": [a.id for a in pendentes]}})
```

Chame `_garantir_acessibilidade` no `update_post` e exponha também o verbo `PATCH /{post_id}`, que é o contrato do PI 2 para atualização parcial.

**Passo 7 — Teste os casos de erro**

No Swagger: envie uma imagem com `alt_text` igual a `"foto"` (espera 422), depois com `"Grafico de barras com o crescimento mensal"` (espera 201). Em seguida mude o `alt_text` para vazio e tente `PATCH /posts/{id}` com `status: "scheduled"` (espera 422 com `acessibilidade_pendente`).

**Passo 8 — Commite e abra o PR**
```bash
git add backend/app/services/accessibility.py backend/app/schemas/post_asset.py backend/app/routes/assets.py backend/app/routes/posts.py backend/app/repositories/post_assets.py
git commit -m "feat: tornar o texto alternativo obrigatorio e validado na api"
git push origin feat/pi2-t06-alt-text-obrigatorio
# Abra PR no GitHub: Closes #83
```

### Definition of Done ✅
- [ ] `accessibility.py` valida tamanho de 10 a 300 caracteres e recusa termos genéricos
- [ ] Upload com `alt_text` inválido responde 422 com mensagem em português
- [ ] `PATCH /assets/{id}` usa o mesmo validador
- [ ] Mudar um post com imagem sem alt para `scheduled` ou `published` responde 422 com o código `acessibilidade_pendente`
- [ ] `PATCH /posts/{id}` existe e funciona igual ao `PUT`
- [ ] PR aberto com `Closes #83` na descrição

---

## Tarefa 7 — Imagem única com Pillow

| Campo | Valor |
|-------|-------|
| **Integrante** | Diego Gustavo Franco |
| **Issue** | #81 |
| **Branch** | `feat/pi2-t07-imagem-unica` |
| **Área** | Backend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 4–5 horas |
| **Depende de** | Tarefa 5 (issue #80) |

### Por que esta tarefa existe
No LinkedIn um post sem imagem perde alcance. Esta tarefa gera automaticamente um card quadrado com a marca Flowity, o gancho do post e o CTA, salvo como `PostAsset` e já com texto alternativo preenchido a partir do gancho.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t07-imagem-unica
```

**Passo 2 — Adicione o Pillow**

Acrescente `pillow==11.0.0` ao final de `backend/requirements.txt` e instale:

```bash
cd backend && pip install -r requirements.txt
python -c "import PIL; print(PIL.__version__)"
```

**Passo 3 — Embarque a fonte**

Crie `backend/app/assets/fonts/` e coloque nela `Inter-Bold.ttf` e `Inter-Regular.ttf` (licença livre). O serviço precisa funcionar mesmo sem os arquivos, caindo em `ImageFont.load_default()`, porque o contêiner pode subir sem eles.

**Passo 4 — Escreva o serviço** `backend/app/services/image_renderer.py`

As cores são as da marca, as mesmas já usadas no frontend:

```python
COR_FUNDO = "#080810"
COR_TEXTO = "#FFFFFF"
COR_SECUNDARIA = "#A8AABA"
COR_ROXO = "#9C83F7"
COR_CIANO = "#1CD8DE"
LARGURA = ALTURA = 1200
MARGEM = 96
DIR_FONTES = Path(__file__).resolve().parent.parent / "assets" / "fonts"
```

Escreva quatro funções: `_carregar_fonte(nome, tamanho)` (carrega a fonte embarcada ou cai no default); `quebrar_em_linhas(draw, texto, fonte, largura_max)` (quebra palavra a palavra, medindo com `draw.textbbox`); `ajustar_fonte(draw, texto, nome_fonte, largura_max, altura_max, tamanho_inicial=84, tamanho_minimo=36)` (reduz o corpo até o texto caber); e `alt_text_padrao(hook)`, que devolve `f"Cartão com o texto: {hook}"`.

**Passo 5 — Escreva `renderizar_card(hook, cta, destino) -> dict`**

```python
imagem = Image.new("RGB", (LARGURA, ALTURA), COR_FUNDO)
draw = ImageDraw.Draw(imagem)
draw.rectangle([MARGEM, MARGEM, MARGEM + 120, MARGEM + 12], fill=COR_ROXO)
draw.rectangle([MARGEM + 132, MARGEM, MARGEM + 200, MARGEM + 12], fill=COR_CIANO)
# hook com ajustar_fonte + quebrar_em_linhas, CTA em COR_CIANO no rodape,
# assinatura "Flowity" em COR_SECUNDARIA no canto inferior esquerdo
destino.parent.mkdir(parents=True, exist_ok=True)
imagem.save(destino, format="PNG", optimize=True)
return {"width": LARGURA, "height": ALTURA,
        "size_bytes": destino.stat().st_size, "mime_type": "image/png"}
```

**Passo 6 — Crie o endpoint** em `backend/app/routes/assets.py`

Reaproveita `_media_root()` e `_com_url()` criados na Tarefa 5:

```python
@router.post("/posts/{post_id}/render/image", response_model=PostAssetResponse,
             status_code=201, summary="Gera o card 1200x1200 do post")
def render_image(post_id: int, data: RenderImageRequest | None = None,
                 db=Depends(get_db), _admin=Depends(get_current_admin)):
    post = post_repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    hook = ((data.hook if data else None) or post.hook or "").strip()
    if not hook:
        raise HTTPException(status_code=422, detail="O post precisa de um hook.")
    caminho_relativo = f"posts/{post_id}/card-{uuid.uuid4().hex}.png"
    meta = image_renderer.renderizar_card(hook, post.cta, _media_root() / caminho_relativo)
    asset = asset_repo.create(db, post_id=post_id, kind="image",
        position=asset_repo.next_position(db, post_id), file_path=caminho_relativo,
        alt_text=image_renderer.alt_text_padrao(hook), **meta)
    return _com_url(asset)
```

Em `backend/app/schemas/post_asset.py` acrescente `RenderImageRequest` com `hook`, `cta` e `alt_text`, todos opcionais.

**Passo 7 — Teste com um hook longo e um curto**

```bash
docker compose up --build backend
# no Swagger: POST /posts/1/render/image, depois abra a url devolvida no navegador
python -c "from PIL import Image; print(Image.open('media/posts/1/card-<hash>.png').size)"
# o tamanho impresso tem que ser (1200, 1200) e nenhuma letra pode estourar a margem
```

**Passo 8 — Commite e abra o PR**
```bash
git add backend/requirements.txt backend/app/services/image_renderer.py backend/app/assets/fonts/ backend/app/schemas/post_asset.py backend/app/routes/assets.py
git commit -m "feat: gerar a imagem unica do post com pillow"
git push origin feat/pi2-t07-imagem-unica
# Abra PR no GitHub: Closes #81
```

### Definition of Done ✅
- [ ] `pillow==11.0.0` no `requirements.txt` e serviço funcionando sem as fontes embarcadas
- [ ] `image_renderer.py` implementa `quebrar_em_linhas`, `ajustar_fonte` e `alt_text_padrao`
- [ ] `POST /posts/{id}/render/image` responde 201 e 404 quando o post não existe
- [ ] O PNG gerado tem exatamente 1200x1200 e usa as cores da marca
- [ ] O asset criado nasce com `alt_text` preenchido a partir do hook
- [ ] Captura do card gerado anexada no PR
- [ ] PR aberto com `Closes #81` na descrição

---

## Tarefa 8 — Carrossel do LinkedIn

| Campo | Valor |
|-------|-------|
| **Integrante** | Davi Corrêa Bueno |
| **Issue** | #82 |
| **Branch** | `feat/pi2-t08-carrossel` |
| **Área** | Backend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 5–6 horas |
| **Depende de** | Tarefa 5 (issue #80) e Tarefa 7 (issue #81) |

### Por que esta tarefa existe
O carrossel é o formato de maior retenção do LinkedIn e a entrega visual central do PI 2. O detalhe técnico que define a tarefa: o LinkedIn não aceita imagens soltas, ele ingere um PDF de várias páginas. O serviço gera cada slide como PNG 1080x1350 e une todos em um único PDF.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t08-carrossel
```

**Passo 2 — Crie o serviço** `backend/app/services/carousel_renderer.py`

Reaproveite as funções da Tarefa 7, não as reescreva:

```python
from app.services.image_renderer import (
    COR_FUNDO, COR_TEXTO, COR_SECUNDARIA, COR_ROXO, COR_CIANO,
    _carregar_fonte, _altura_linha, quebrar_em_linhas, ajustar_fonte,
)

LARGURA = 1080   # proporcao 4:5, recomendada para documentos do LinkedIn
ALTURA = 1350
MARGEM = 88
MIN_SLIDES = 3
MAX_SLIDES = 10
```

**Passo 3 — Divida o corpo do post em slides**

`dividir_em_slides(hook, body, cta)` monta capa + blocos de conteúdo + slide de CTA:

```python
blocos = [b.strip() for b in re.split(r"\n\s*\n", (body or "").strip()) if b.strip()]
if len(blocos) < 3:                      # sem paragrafos, quebra por frase
    blocos = [f.strip() for f in re.split(r"(?<=[.!?])\s+", texto) if f.strip()]
if len(blocos) > 8:                      # junta blocos vizinhos ate caber
    passo = -(-len(blocos) // 8)
    blocos = [" ".join(blocos[i:i + passo]) for i in range(0, len(blocos), passo)]
slides = [hook] + blocos[:8]
if cta:
    slides.append(cta)
```
E `validar_quantidade(slides)` levanta `ValueError` se ficar fora de 3 a 10 slides.

**Passo 4 — Renderize cada slide e numere**

`renderizar_slide(texto, indice, total, destino, eh_capa)` desenha um PNG 1080x1350 no mesmo estilo do card da Tarefa 7 e escreve a numeração `"{indice}/{total}"` no rodapé. Cada slide ganha texto alternativo próprio com `alt_text_slide(texto, indice, total)`, que devolve `f"Slide {indice} de {total} do carrossel: {texto[:240]}"`.

**Passo 5 — Junte os slides em um PDF**

`renderizar_carrossel(slides, pasta, prefixo)` chama `validar_quantidade`, renderiza tudo e devolve um dicionário com a lista de slides, o nome do PDF e o tamanho dele:

```python
imagens[0].save(caminho_pdf, format="PDF", resolution=150.0,
                save_all=True, append_images=imagens[1:])
```
Os arquivos ficam como `{prefixo}-slide-01.png` … e `{prefixo}-carrossel.pdf`.

**Passo 6 — Crie o endpoint** em `backend/app/routes/assets.py`

```python
@router.post("/posts/{post_id}/render/carousel", response_model=CarouselResponse,
             status_code=201, summary="Gera os slides e o PDF do carrossel")
def render_carousel(post_id: int, data: RenderCarouselRequest | None = None,
                    db=Depends(get_db), _admin=Depends(get_current_admin)):
    post = post_repo.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    slides = (data.slides if data else None) or carousel_renderer.dividir_em_slides(
        post.hook, post.body, post.cta)
    try:
        carousel_renderer.validar_quantidade(slides)
    except ValueError as erro:
        raise HTTPException(status_code=422, detail=str(erro))
    # renderiza, cria um PostAsset kind="carousel_slide" por slide com position
    # sequencial a partir de asset_repo.next_position(db, post_id), devolve CarouselResponse
```

Em `backend/app/schemas/post_asset.py` acrescente `RenderCarouselRequest` (campo `slides: list[str] | None`) e `CarouselResponse` (`post_id`, `total_slides`, `slides`, `pdf_url`, `pdf_size_bytes`).

**Passo 7 — Teste os limites**

```bash
docker compose up --build backend
# no Swagger: POST /posts/1/render/carousel com slides = 2 itens  -> espera 422
# depois sem body, deixando o post ser dividido automaticamente   -> espera 201
python -c "from PIL import Image; print(Image.open('media/posts/1/<prefixo>-slide-01.png').size)"
# abra o PDF devolvido em pdf_url e confira que ha uma pagina por slide
```

**Passo 8 — Commite e abra o PR**
```bash
git add backend/app/services/carousel_renderer.py backend/app/schemas/post_asset.py backend/app/routes/assets.py
git commit -m "feat: gerar o carrossel do linkedin com slides png e pdf"
git push origin feat/pi2-t08-carrossel
# Abra PR no GitHub: Closes #82
```

### Definition of Done ✅
- [ ] `dividir_em_slides` monta capa, conteúdo e CTA a partir do corpo do post
- [ ] Carrossel com menos de 3 ou mais de 10 slides responde 422
- [ ] Todos os PNGs gerados têm exatamente 1080x1350 e trazem a numeração do slide
- [ ] O PDF tem uma página por slide e a URL dele volta em `pdf_url`
- [ ] Cada slide vira um `PostAsset` com `kind="carousel_slide"`, `position` sequencial e `alt_text` próprio
- [ ] O serviço reaproveita `quebrar_em_linhas` e `ajustar_fonte` da Tarefa 7
- [ ] PR aberto com `Closes #82` na descrição

## Tarefa 9 — Upload de imagem no post

| Campo | Valor |
|-------|-------|
| **Integrante** | Pedro Luiz Simonetti Filho |
| **Issue** | #85 |
| **Branch** | `feat/pi2-t09-upload-imagem` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–5 horas |
| **Depende de** | Tarefa 5 (issue #80) |

### Por que esta tarefa existe
Hoje o post só tem texto. O PI 2 exige que a peça saia pronta de dentro da ferramenta, com imagem.
E toda imagem precisa de texto alternativo: sem ele, a imagem simplesmente não existe para quem usa
leitor de tela. Por isso o alt text é obrigatório aqui, e não opcional.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t09-upload-imagem
```

**Passo 2 — Adicione o `assetsApi` em `frontend/src/lib/api.js`**

Depois do `postsApi`, no mesmo estilo dos outros objetos exportados:
```javascript
export const assetsApi = {
  list: (postId) => api.get(`/posts/${postId}/assets`),
  upload: (postId, file, altText) => {
    const form = new FormData();
    form.append("file", file);
    form.append("alt_text", altText);
    return api.post(`/posts/${postId}/assets`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  update: (id, data) => api.patch(`/assets/${id}`, data),
  remove: (id) => api.delete(`/assets/${id}`),
};
```

**Passo 3 — Crie `frontend/src/components/posts/PostImageUploader.jsx`**
- Use um `<input type="file" accept="image/png,image/jpeg">` com `<label>` de texto real
- Não faça drag-and-drop. O seletor de arquivo já resolve e é mais simples de tornar acessível
- Ao escolher o arquivo, mostre a pré-visualização com `URL.createObjectURL(file)`

**Passo 4 — Valide o arquivo no navegador, antes de enviar**
```javascript
const TIPOS = ["image/png", "image/jpeg"];
const MAX_BYTES = 5 * 1024 * 1024;

function validarArquivo(file) {
  if (!TIPOS.includes(file.type)) return "Use apenas PNG ou JPEG.";
  if (file.size > MAX_BYTES) return "A imagem precisa ter no máximo 5 MB.";
  return null;
}
```
Mostre o erro em texto, nunca só mudando a cor da borda.

**Passo 5 — Campo de texto alternativo obrigatório**
- `<textarea>` com `<label>` "Texto alternativo (obrigatório)"
- Contador visível com mínimo de 10 e máximo de 300 caracteres
- O botão "Salvar imagem" fica `disabled` enquanto o alt tiver menos de 10 caracteres
- Ligue o contador ao campo com `aria-describedby`

**Passo 6 — Integre no `frontend/src/components/posts/PostModal.jsx`**
- Crie a seção "Imagens do post", entre o campo "Versão para X" e o bloco de Status/Channel
- Ao abrir o modal, chame `assetsApi.list(post.id)` e liste as imagens já enviadas
- Cada item da lista mostra o alt text e um botão "Remover" que chama `assetsApi.remove(id)`

**Passo 7 — Teste**
```bash
cd frontend && npm install && npm run dev
# Abra um post no Pipeline, envie um PNG e tente salvar com o alt text vazio
```

**Passo 8 — Commite e abra o PR**
```bash
git add frontend/src/lib/api.js frontend/src/components/posts/
git commit -m "feat: enviar imagem do post com texto alternativo obrigatorio"
git push origin feat/pi2-t09-upload-imagem
# Abra PR no GitHub: Closes #85
```

### Definition of Done ✅
- [ ] `PostImageUploader.jsx` criado, com seletor de arquivo e `<label>` de texto real
- [ ] Arquivo fora de PNG/JPEG ou acima de 5 MB é recusado com mensagem em texto
- [ ] A pré-visualização da imagem aparece antes do envio
- [ ] O botão de salvar fica desabilitado enquanto o alt text tiver menos de 10 caracteres
- [ ] `assetsApi` adicionado em `frontend/src/lib/api.js` e usado pelo `PostModal.jsx`
- [ ] PR aberto com `Closes #85` na descrição

---

## Tarefa 10 — Montar o carrossel do LinkedIn

| Campo | Valor |
|-------|-------|
| **Integrante** | Roger Luiz de Paula |
| **Issue** | #86 |
| **Branch** | `feat/pi2-t10-carousel-builder` |
| **Área** | Frontend |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 5–6 horas |
| **Depende de** | Tarefa 8 (issue #82) e Tarefa 9 (issue #85) |

### Por que esta tarefa existe
O carrossel é o formato que mais engaja no LinkedIn, e hoje ele é montado à mão no Canva.
Esta tarefa traz a montagem para dentro da ferramenta: o corpo do post vira slides,
o usuário ajusta o texto e a ordem, e o backend gera o carrossel.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t10-carousel-builder
```

**Passo 2 — Adicione `render` ao `postsApi` em `frontend/src/lib/api.js`**
```javascript
// dentro do objeto postsApi já existente
render: {
  carousel: (postId, slides) =>
    api.post(`/posts/${postId}/render/carousel`, { slides }),
},
```

**Passo 3 — Crie a função que divide o corpo em slides**

Em `frontend/src/lib/carouselSlides.mjs`, sem React, para ficar fácil de testar:
```javascript
export const MIN_SLIDES = 3;
export const MAX_SLIDES = 10;

/** Divide o corpo do post em blocos de texto, um por slide. */
export function dividirEmSlides(body, maxCaracteres = 220) {
  const paragrafos = String(body || "").split(/\n{2,}/).map((p) => p.trim());
  return paragrafos.filter(Boolean).map((p) => p.slice(0, maxCaracteres));
}
```

**Passo 4 — Crie `frontend/src/components/carousel/SlideCard.jsx`**
- Mostra o número do slide e um `<textarea>` com o texto, editável
- Dois botões: "Mover para cima" e "Mover para baixo" (são `<button>` de verdade)
- O primeiro slide tem o botão "para cima" desabilitado; o último, o "para baixo"
- Não use drag-and-drop. Os botões são mais simples e já são a via acessível

**Passo 5 — Crie `frontend/src/components/carousel/CarouselBuilder.jsx`**
- Recebe a lista de slides e guarda no estado
- Botões "Adicionar slide" e "Remover slide", respeitando o mínimo de 3 e o máximo de 10
- Reordenação por troca de posições:
```javascript
function mover(slides, indice, direcao) {
  const destino = indice + direcao;
  if (destino < 0 || destino >= slides.length) return slides;
  const copia = [...slides];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}
```
- Botão "Gerar carrossel" chama `postsApi.render.carousel(postId, slides)` e fica desabilitado
  enquanto houver menos de 3 ou mais de 10 slides

**Passo 6 — Crie `frontend/src/pages/CarouselPage.jsx`**
- Rota `/carousel/:postId`, pega o `postId` com `useParams()`
- Carrega o post com `postsApi.get(postId)` e chama `dividirEmSlides(post.body)`
- Renderiza o `CarouselBuilder` e uma pré-visualização simples na proporção 4:5,
  com fundo `#07080F` e o texto do slide atual

**Passo 7 — Registre a rota e o item de menu**
- Em `frontend/src/App.jsx`, adicione `<Route path="/carousel/:postId" element={<CarouselPage />} />`
  dentro do `AppShell`
- Em `frontend/src/components/layout/AppShell.jsx`, adicione "Carrossel" ao `NAV_ITEMS`,
  apontando para o pipeline quando ainda não houver post escolhido

**Passo 8 — Teste e abra o PR**
```bash
cd frontend && npm run dev
# Abra /carousel/1, edite os slides, reordene e clique em "Gerar carrossel"
git add frontend/src
git commit -m "feat: montar e pre-visualizar o carrossel do LinkedIn"
git push origin feat/pi2-t10-carousel-builder
# Abra PR no GitHub: Closes #86
```

### Definition of Done ✅
- [ ] Rota `/carousel/:postId` registrada no `App.jsx` e item "Carrossel" no `AppShell.jsx`
- [ ] O corpo do post é dividido em slides automaticamente ao abrir a página
- [ ] O texto de cada slide pode ser editado
- [ ] A ordem muda pelos botões "mover para cima" e "mover para baixo", sem drag-and-drop
- [ ] O botão "Gerar carrossel" só habilita com 3 a 10 slides e chama `POST /posts/{id}/render/carousel`
- [ ] PR aberto com `Closes #86` na descrição

---

## Tarefa 11 — Teclado e leitor de tela no carrossel

| Campo | Valor |
|-------|-------|
| **Integrante** | Roger Luiz de Paula |
| **Issue** | #88 |
| **Branch** | `feat/pi2-t11-teclado-leitor-tela` |
| **Área** | Frontend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 3–4 horas |
| **Depende de** | Tarefa 10 (issue #86) |

### Por que esta tarefa existe
Quem não usa mouse precisa conseguir montar o carrossel só pelo teclado.
E quem usa leitor de tela precisa ouvir em qual slide está. Sem isso, a tela existe
visualmente mas não é utilizável, e o PI 2 exige acessibilidade de verdade.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t11-teclado-leitor-tela
```

**Passo 2 — Setas para andar entre os slides no `CarouselBuilder.jsx`**
```jsx
function onKeyDown(e) {
  if (e.key === "ArrowRight") { setAtual((i) => Math.min(i + 1, slides.length - 1)); e.preventDefault(); }
  if (e.key === "ArrowLeft")  { setAtual((i) => Math.max(i - 1, 0)); e.preventDefault(); }
}
// no container da lista de slides:
<div onKeyDown={onKeyDown} tabIndex={0} aria-label="Lista de slides do carrossel">
```

**Passo 3 — Enter e Espaço abrem a edição no `SlideCard.jsx`**
- O card do slide é um `<button>` (ou tem `role="button"` com `tabIndex={0}`)
- `Enter` ou `Espaço` colocam o slide em modo de edição e movem o foco para o `<textarea>`
- Não implemente roving tabindex. Basta que cada slide receba foco pelo Tab

**Passo 4 — Rotule cada slide**
```jsx
<li
  role="group"
  aria-roledescription="slide"
  aria-label={`Slide ${indice + 1} de ${total}`}
>
```

**Passo 5 — Anuncie a troca de slide numa região `aria-live`**
```jsx
<p className="sr-only" role="status" aria-live="polite">
  Slide {atual + 1} de {slides.length}
</p>
```
Se a classe `sr-only` não existir no projeto, o Tailwind 3 já a fornece nativamente.

**Passo 6 — Escape fecha o modal e devolve o foco**

Em `frontend/src/components/posts/PostModal.jsx`:
```jsx
useEffect(() => {
  const anterior = document.activeElement;
  const onKey = (e) => { if (e.key === "Escape") onClose(); };
  document.addEventListener("keydown", onKey);
  return () => {
    document.removeEventListener("keydown", onKey);
    if (anterior) anterior.focus();   // devolve o foco a quem abriu o modal
  };
}, [onClose]);
```

**Passo 7 — Teste manual com o NVDA**

Baixe o NVDA em https://www.nvaccess.org/download/ (gratuito, Windows). Rode este roteiro
e anote o que o leitor falou em cada passo, no arquivo `PI2/evidencias/nvda-roteiro.md`:
1. Abrir `/carousel/1` só com o teclado (Tab até chegar na lista de slides)
2. Andar com seta direita e seta esquerda entre os slides
3. Confirmar que o NVDA fala "Slide 2 de 7" ao trocar
4. Apertar Enter para editar um slide e digitar um texto
5. Abrir o PostModal, apertar Escape e confirmar que o foco voltou para o botão de origem

**Passo 8 — Commite e abra o PR**
```bash
git add frontend/src PI2/evidencias/nvda-roteiro.md
git commit -m "feat: navegacao por teclado e leitor de tela no carrossel"
git push origin feat/pi2-t11-teclado-leitor-tela
# Abra PR no GitHub: Closes #88
```

### Definition of Done ✅
- [ ] Setas esquerda e direita mudam o slide atual
- [ ] Enter ou Espaço abrem a edição do slide e movem o foco para o campo de texto
- [ ] Cada slide tem `aria-label="Slide N de M"`
- [ ] A troca de slide é anunciada numa região `aria-live="polite"`
- [ ] Escape fecha o `PostModal` e devolve o foco a quem o abriu
- [ ] `PI2/evidencias/nvda-roteiro.md` preenchido com o resultado dos 5 passos
- [ ] PR aberto com `Closes #88` na descrição

---

## Tarefa 12 — Baixar o carrossel em PDF

| Campo | Valor |
|-------|-------|
| **Integrante** | Tiago Antonio Ferreira |
| **Issue** | #93 |
| **Branch** | `feat/pi2-t12-exportar-carrossel` |
| **Área** | Frontend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 3–4 horas |
| **Depende de** | Tarefa 8 (issue #82) e Tarefa 10 (issue #86) |

### Por que esta tarefa existe
O LinkedIn publica carrossel como documento PDF. Sem o botão de download, o carrossel
gerado fica preso no sistema. A checklist evita o erro mais comum na hora de publicar:
subir o arquivo sem a legenda ou sem o texto alternativo preenchido.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t12-exportar-carrossel
```

**Passo 2 — Adicione o helper `apiDownload` em `frontend/src/lib/api.js`**
```javascript
export async function apiDownload(url, nomeArquivo) {
  const resposta = await api.get(url, { responseType: "blob" });
  const href = URL.createObjectURL(resposta.data);
  const link = document.createElement("a");
  link.href = href;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}
```

**Passo 3 — Crie `frontend/src/components/carousel/CarouselExport.jsx`**
- Um botão "Baixar PDF" que chama `apiDownload(`/posts/${postId}/render/carousel`, "carrossel.pdf")`
- Enquanto baixa: `disabled`, `aria-busy="true"` e o texto muda para "Gerando PDF..."
- Se der erro, mostre a mensagem em texto num `<p role="alert">`
- Não implemente o download em ZIP dos PNGs

**Passo 4 — Botão "Copiar legenda"**
```jsx
async function copiarLegenda() {
  await navigator.clipboard.writeText(`${post.hook}\n\n${post.body}\n\n${post.cta}`);
  setAviso("Legenda copiada.");
}
```
O aviso vai num `<p role="status">`, para o leitor de tela também anunciar.

**Passo 5 — Crie `frontend/src/components/carousel/PublishChecklist.jsx`**

Painel "Checklist de publicação no LinkedIn", com os itens calculados a partir dos dados reais:
1. O carrossel tem entre 3 e 10 slides
2. Todas as imagens têm texto alternativo com 10 caracteres ou mais
3. O post tem `hook`, `body` e `cta` preenchidos
4. O PDF já foi baixado

Cada item mostra ícone **e** texto ("Pronto" / "Falta"), nunca só a cor.

**Passo 6 — Integre na `frontend/src/pages/CarouselPage.jsx`**
- Renderize `CarouselExport` e `PublishChecklist` abaixo do builder
- A área só aparece depois que o carrossel foi gerado ao menos uma vez

**Passo 7 — Teste**
```bash
cd frontend && npm run dev
# Gere o carrossel, clique em "Baixar PDF" e confira o arquivo salvo
# Desligue o backend e clique de novo: a mensagem de erro precisa aparecer
```

**Passo 8 — Commite e abra o PR**
```bash
git add frontend/src
git commit -m "feat: baixar carrossel em pdf e checklist de publicacao"
git push origin feat/pi2-t12-exportar-carrossel
# Abra PR no GitHub: Closes #93
```

### Definition of Done ✅
- [ ] `apiDownload` adicionado em `frontend/src/lib/api.js` com `responseType: "blob"`
- [ ] Botão "Baixar PDF" salva o arquivo e mostra o estado de carregando
- [ ] Erro de download aparece em texto visível, não só no console
- [ ] Botão "Copiar legenda" copia hook, body e cta e confirma a ação
- [ ] `PublishChecklist.jsx` mostra ícone mais texto em cada item
- [ ] PR aberto com `Closes #93` na descrição

---

## Tarefa 13 — Painel de análise das publicações

| Campo | Valor |
|-------|-------|
| **Integrante** | João Maike Silva de Jesus |
| **Issue** | #90 |
| **Branch** | `feat/pi2-t13-dashboard-analise` |
| **Área** | Frontend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 5–6 horas |
| **Depende de** | Tarefa 3 (issue #89) |

### Por que esta tarefa existe
Hoje o time publica e não sabe o que funcionou. Este painel responde duas perguntas simples:
em que dia da semana o engajamento é maior, e qual plataforma rende mais por publicação.
Como a Tarefa 3 foi reduzida, a agregação por dia da semana entra aqui.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t13-dashboard-analise
```

**Passo 2 — Acrescente a agregação por dia da semana no backend**

Em `backend/app/routes/metrics.py`, dentro de `GET /metrics/summary`:
```python
from sqlalchemy import func

linhas = (
    db.query(
        func.extract("dow", Post.published_at).label("dia"),
        func.avg(PostMetric.engagement_rate).label("media"),
    )
    .join(Post, Post.id == PostMetric.post_id)
    .group_by("dia")
    .all()
)
resumo["por_dia_semana"] = [
    {"dia": int(l.dia), "media": float(l.media or 0)} for l in linhas
]
```
Teste em `http://localhost:8000/docs` antes de seguir.

**Passo 3 — Adicione o `metricsApi` em `frontend/src/lib/api.js`**
```javascript
export const metricsApi = {
  summary: (params) => api.get("/metrics/summary", { params }),
  create: (postId, data) => api.post(`/posts/${postId}/metrics`, data),
};
```

**Passo 4 — Crie `frontend/src/components/analytics/StatCard.jsx`**

Cartão simples com rótulo e número, usando as classes `card`, `text-text-muted` e
`text-flowity-purple`. A página vai usar quatro: total de publicações, total de impressões,
total de interações e taxa média de engajamento.

**Passo 5 — Crie `frontend/src/components/analytics/BarChart.jsx`**

Um gráfico de barras em SVG inline, sem instalar biblioteca nenhuma:
```jsx
<svg role="img" aria-labelledby="gTitulo gDesc" viewBox={`0 0 ${largura} 200`}>
  <title id="gTitulo">Engajamento médio por dia da semana</title>
  <desc id="gDesc">Barras comparando a taxa média de engajamento de cada dia.</desc>
  {dados.map((d, i) => (
    <rect key={d.dia} x={i * 48} y={200 - d.altura} width="32" height={d.altura} fill="#9C83F7" />
  ))}
</svg>
```
Abaixo do SVG, repita os mesmos números numa `<table>` com a classe `sr-only`,
para quem usa leitor de tela ter acesso aos dados exatos.

**Passo 6 — Crie `frontend/src/components/analytics/PlatformCompare.jsx`**
- Compara LinkedIn e X lado a lado
- Use a taxa normalizada (interações dividido por impressões), não o total bruto
- Mostre também quantas publicações cada plataforma teve, para o leitor entender o peso
  do número. Ex.: "LinkedIn: 4,2% em 18 publicações"

**Passo 7 — Crie `frontend/src/pages/AnalyticsPage.jsx` e registre a rota**
- A página busca `metricsApi.summary()` e monta os 4 cartões, o gráfico e a comparação
- Em `frontend/src/App.jsx`, adicione `<Route path="/analytics" element={<AnalyticsPage />} />`
- Em `frontend/src/components/layout/AppShell.jsx`, adicione "Analytics" ao `NAV_ITEMS`,
  entre Pipeline e Settings

**Passo 8 — Commite e abra o PR**
```bash
git add backend/app frontend/src
git commit -m "feat: painel de analise com engajamento por dia e comparacao de plataformas"
git push origin feat/pi2-t13-dashboard-analise
# Abra PR no GitHub: Closes #90
```

### Definition of Done ✅
- [ ] `GET /metrics/summary` devolve `por_dia_semana`, testado pelo Swagger
- [ ] A página `/analytics` abre com os 4 cartões preenchidos
- [ ] O gráfico de barras é SVG inline, com `<title>`, `<desc>` e `<table>` equivalente em `sr-only`
- [ ] A comparação LinkedIn x X usa taxa normalizada e mostra o número de publicações de cada uma
- [ ] Nenhuma biblioteca de gráficos foi adicionada ao `package.json`
- [ ] PR aberto com `Closes #90` na descrição

---

## Tarefa 14 — Alerta de engajamento baixo

| Campo | Valor |
|-------|-------|
| **Integrante** | Tiago Antonio Ferreira |
| **Issue** | #91 |
| **Branch** | `feat/pi2-t14-alertas-engajamento` |
| **Área** | Backend e Frontend |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 3–4 horas |
| **Depende de** | Tarefa 3 (issue #89) |

### Por que esta tarefa existe
Ver o número no painel só ajuda quem entra no painel. O alerta inverte isso: o sistema avisa
quando um post ficou abaixo do esperado. Um único limite configurável já resolve, e mantém
a tarefa pequena.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t14-alertas-engajamento
```

**Passo 2 — Crie o modelo `backend/app/models/alert_setting.py`**
```python
class AlertSetting(Base):
    __tablename__ = "alert_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    min_engagement_rate: Mapped[float] = mapped_column(Float, default=0.02)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
```
Registre o módulo em `create_tables()`, em `backend/app/db/database.py`.

**Passo 3 — Crie o schema `backend/app/schemas/alert.py`**
- `AlertSettingRead` e `AlertSettingUpdate` com `min_engagement_rate` (float entre 0 e 1)
- `AlertRead` com `post_id`, `hook`, `channel`, `engagement_rate` e `published_at`
- Use `model_config = {"from_attributes": True}`, como no resto do projeto

**Passo 4 — Crie as rotas em `backend/app/routes/alerts.py`**
- `GET /settings/alerts` devolve a configuração (cria a linha padrão de 2% se não existir)
- `PUT /settings/alerts` grava o novo limite
- `GET /alerts` lista os posts publicados cuja taxa ficou abaixo do limite:
```python
limite = repo.get_settings(db).min_engagement_rate
return (
    db.query(PostMetric)
    .join(Post, Post.id == PostMetric.post_id)
    .filter(PostMetric.engagement_rate < limite)
    .order_by(Post.published_at.desc())
    .all()
)
```
Registre o router em `backend/app/main.py`.

**Passo 5 — Adicione o `alertsApi` em `frontend/src/lib/api.js`**
```javascript
export const alertsApi = {
  getSettings: () => api.get("/settings/alerts"),
  updateSettings: (data) => api.put("/settings/alerts", data),
  list: () => api.get("/alerts"),
};
```

**Passo 6 — Seção "Alertas" na `frontend/src/pages/SettingsPage.jsx`**
- Card novo com um `<input type="number">` rotulado "Taxa mínima de engajamento (%)"
- Valor padrão 2. Ao salvar, chama `alertsApi.updateSettings({ min_engagement_rate: valor / 100 })`
- Mostre uma confirmação em texto depois de salvar

**Passo 7 — Crie `frontend/src/components/alerts/AlertBanner.jsx`**
- Lista os alertas de `alertsApi.list()` dentro de um bloco com `role="status"`
- Cada item traz ícone **e** texto: "Abaixo do limite — 1,1% (limite: 2%)"
- Nunca comunique o alerta só pela cor
- Renderize o banner no topo da `AnalyticsPage.jsx`

**Passo 8 — Commite e abra o PR**
```bash
git add backend/app frontend/src
git commit -m "feat: alerta de post abaixo do limite de engajamento"
git push origin feat/pi2-t14-alertas-engajamento
# Abra PR no GitHub: Closes #91
```

### Definition of Done ✅
- [ ] Tabela `alert_settings` criada, com um único limite configurável
- [ ] `GET /settings/alerts`, `PUT /settings/alerts` e `GET /alerts` testados pelo Swagger
- [ ] A SettingsPage salva o limite e confirma a gravação em texto
- [ ] `AlertBanner.jsx` lista os alertas num bloco `role="status"`, com ícone mais texto
- [ ] O limite padrão é 2% quando ninguém configurou nada
- [ ] PR aberto com `Closes #91` na descrição

---

## Tarefa 15 — Testes automatizados do projeto

| Campo | Valor |
|-------|-------|
| **Integrante** | Diego Gustavo Franco |
| **Issue** | #96 |
| **Branch** | `feat/pi2-t15-testes` |
| **Área** | Testes |
| **Prioridade** | 🔴 Alta |
| **Estimativa** | 4–5 horas |
| **Depende de** | Tarefa 5 (issue #80) e Tarefa 6 (issue #83) |

### Por que esta tarefa existe
O projeto não tem nenhum teste rodando automaticamente. Poucos testes que rodam a cada
pull request valem mais do que muitos testes que ninguém executa. A meta aqui é montar
a estrutura e provar que ela funciona, com seis testes.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t15-testes
```

**Passo 2 — Instale o pytest e crie o `conftest.py`**
```bash
cd backend && pip install pytest httpx
```
Em `backend/tests/conftest.py`, monte o `TestClient` com SQLite em memória:
```python
engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                       poolclass=StaticPool)
Base.metadata.create_all(engine)
app.dependency_overrides[get_db] = lambda: TestingSession()
app.dependency_overrides[get_current_admin] = lambda: "admin"

@pytest.fixture
def client():
    return TestClient(app)
```

**Passo 3 — Escreva os quatro testes de backend**

Em `backend/tests/test_assets.py`:
1. `test_upload_png_aceito` — envia um PNG e espera 201
2. `test_upload_tipo_invalido` — envia um `.txt` e espera 400
3. `test_alt_text_vazio_retorna_422` — envia PNG com `alt_text=""` e espera 422
4. `test_agendar_post_com_imagem_sem_alt_retorna_422` — muda o status para `scheduled`
   com uma imagem sem alt e espera 422

**Passo 4 — Instale o Vitest no frontend**
```bash
cd frontend
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom vitest-axe
```
Em `frontend/package.json`, acrescente `"test": "vitest run"` nos scripts.

**Passo 5 — Configure o ambiente do Vitest**

Crie `frontend/vitest.config.js` com `environment: "jsdom"` e `setupFiles: "./src/test/setup.js"`,
e crie `frontend/src/test/setup.js` com `import "@testing-library/jest-dom";`.

**Passo 6 — Escreva os dois testes de frontend**

Em `frontend/src/components/posts/PostModal.test.jsx`:
1. Renderiza o modal, deixa o alt text vazio e espera o botão Salvar com `toBeDisabled()`
2. Roda o axe na tela renderizada e espera zero violações:
```javascript
const { container } = render(<PostModal post={postFake} onClose={() => {}} />);
const resultado = await axe(container);
expect(resultado.violations).toHaveLength(0);
```

**Passo 7 — Crie `.github/workflows/tests.yml`**
```yaml
on: [pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r backend/requirements.txt pytest httpx
      - run: cd backend && pytest -q
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: cd frontend && npm ci && npm test
```
Não configure meta de cobertura.

**Passo 8 — Commite e abra o PR**
```bash
git add backend/tests frontend/src frontend/package.json frontend/vitest.config.js .github
git commit -m "test: configurar pytest e vitest com os primeiros testes"
git push origin feat/pi2-t15-testes
# Abra PR no GitHub: Closes #96
```

### Definition of Done ✅
- [ ] `backend/tests/conftest.py` sobe o app com SQLite em memória
- [ ] Os 4 testes de backend passam com `pytest -q`
- [ ] Os 2 testes de frontend passam com `npm test`
- [ ] O teste do axe termina com zero violações
- [ ] `.github/workflows/tests.yml` roda as duas suítes e fica verde no PR desta issue
- [ ] PR aberto com `Closes #96` na descrição

---

## Tarefa 16 — Medir o ganho de tempo

| Campo | Valor |
|-------|-------|
| **Integrante** | Andrea Nina Maciel Cressoni |
| **Issue** | #94 |
| **Branch** | `feat/pi2-t16-medicao-tempo` |
| **Área** | Projeto |
| **Prioridade** | 🟡 Média |
| **Estimativa** | 4–5 horas |
| **Depende de** | nada (a coleta acontece nas quinzenas 4 a 6) |

### Por que esta tarefa existe
O PI 2 promete reduzir o tempo de produção de uma publicação. Sem medir, isso é opinião.
Esta tarefa cria a linha de base do processo manual, instrumenta a ferramenta para registrar
o tempo real e fecha com uma análise honesta.

### O que fazer (passo a passo)

**Passo 1 — Crie a branch**
```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-t16-medicao-tempo
```

**Passo 2 — Registre a linha de base em `PI2/medicao-desempenho.md`**

Reconstitua com a Flowity AI o processo manual antigo, etapa por etapa (escrever, revisar,
montar imagem, montar carrossel, agendar), com o tempo médio de cada uma. Monte a tabela
comparando três fluxos: manual, PI 1 (só texto) e PI 2 (texto mais mídia).

**Passo 3 — Acrescente os campos ao modelo Post**

Em `backend/app/models/post.py`:
```python
external_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
tools_used: Mapped[str | None] = mapped_column(String(200), nullable=True)
workflow: Mapped[str | None] = mapped_column(String(20), nullable=True)  # manual | pi1 | pi2
```

**Passo 4 — Exponha os campos**
- Em `backend/app/schemas/post.py`, acrescente os três campos ao read e ao update
- Em `frontend/src/components/posts/PostModal.jsx`, adicione os campos ao formulário:
  "Tempo gasto fora da ferramenta (min)", "Ferramentas usadas" e um `<select>` de fluxo
  com as opções manual, pi1 e pi2

**Passo 5 — Crie `GET /reports/performance`**

Em `backend/app/routes/reports.py`, devolva o tempo médio por fluxo:
```python
return (
    db.query(
        Post.workflow,
        func.count(Post.id).label("publicacoes"),
        func.avg(Post.external_minutes).label("media_minutos"),
    )
    .filter(Post.workflow.isnot(None))
    .group_by(Post.workflow)
    .all()
)
```

**Passo 6 — Colete os dados**

Colete 10 publicações por fluxo, ao longo das quinzenas 4 a 6. Registre tudo em
`PI2/dados/tempos-producao.csv`, versionado no repositório, com as colunas:
`id_post,workflow,data,minutos_ferramenta,minutos_externos,ferramentas,alt_preenchido`

**Passo 7 — Escreva a análise e as limitações**

Feche o `PI2/medicao-desempenho.md` com a tabela comparativa, o percentual de redução e uma
seção de limitações honesta: amostra pequena (10 por fluxo), uma única empresa participante
e parte do tempo é autodeclarada, não cronometrada. Limitação declarada vale mais na banca
do que número inflado.

**Passo 8 — Commite e abra o PR**
```bash
git add PI2 backend/app frontend/src
git commit -m "docs: protocolo e instrumentacao da medicao de ganho de tempo"
git push origin feat/pi2-t16-medicao-tempo
# Abra PR no GitHub: Closes #94
```

### Definition of Done ✅
- [ ] `PI2/medicao-desempenho.md` criado com linha de base, protocolo, resultados e limitações
- [ ] Campos `external_minutes`, `tools_used` e `workflow` no modelo e no schema de Post
- [ ] Os três campos aparecem e salvam pelo `PostModal.jsx`
- [ ] `GET /reports/performance` devolve o tempo médio por fluxo, testado pelo Swagger
- [ ] `PI2/dados/tempos-producao.csv` versionado com 10 publicações por fluxo
- [ ] PR aberto com `Closes #94` na descrição

## Cerimônias (Scrum simplificado, igual ao PI 1)

| Cerimônia | Quando | Duração |
|-----------|--------|---------|
| Planejamento da quinzena | Início de cada quinzena | 30 min |
| Daily assíncrona | Todo dia | 5 min (comentário na issue) |
| Revisão | Fim da quinzena | 20 min |
| Retrospectiva | Após a revisão | 15 min |

Entregas oficiais no AVA: Plano de Ação (01/09), Relatório Parcial (30/09), Relatório Final e vídeo
(06/11). Datas completas em [`plano-de-acao-pi2-texto.md`](plano-de-acao-pi2-texto.md).

---

## Checklist de acessibilidade — vale para toda tarefa de tela

Antes de marcar qualquer tarefa de front-end como concluída:

- [ ] Toda imagem tem `alt` significativo (não "imagem", não vazio, salvo decorativa com `alt=""`)
- [ ] Dá para completar a tarefa **só com o teclado** (Tab, Shift+Tab, Enter, Espaço, setas, Esc)
- [ ] O foco é **visível** em todos os elementos interativos
- [ ] Nenhuma informação é passada **apenas por cor**
- [ ] Contraste de texto de no mínimo **4.5:1**
- [ ] Elementos clicáveis são `button` ou `a`, nunca `div` com `onClick`
- [ ] Campos de formulário têm `<label>` associado por `htmlFor`
- [ ] axe DevTools acusa **0 violações críticas ou sérias** na tela alterada

Referências: WCAG 2.1 (W3C, 2018), eMAG (2014), Lei nº 13.146/2015. Detalhes em
[`referencias-bibliograficas.md`](referencias-bibliograficas.md).
