<!-- TITLE: [PI2][P1][Backend] Criar modelo PostMetric e ingestão de métricas de publicação -->
<!-- LABELS: area:backend,prio:p1,sprint:pi2,type:task -->

## Contexto (PI 2)

O relatório final do PI 1 registrou que não foi possível medir o ganho de tempo do processo de postagem nem o desempenho das publicações, porque o Flowity Content Engine guarda apenas o conteúdo e o status do post, e nunca o resultado dele depois de publicado. Sem número de impressões, curtidas, comentários e compartilhamentos não existe base para relatório, para dashboard ou para alerta. Esta issue cria a tabela `post_metrics` e os três endpoints de entrada e leitura dessas métricas. Ela é a fundação das issues PI2-13 (dashboard) e PI2-14 (alertas), que só conseguem começar depois que `GET /metrics/summary` estiver respondendo.

## Integrante responsável

João Maike Silva de Jesus

## Branch

`feat/pi2-12-modelo-metricas-post`

## Estimativa

10 a 14 horas

## Arquivos que você vai criar ou editar

- `backend/app/models/post_metric.py` - novo modelo ORM `PostMetric` (tabela `post_metrics`)
- `backend/app/models/post.py` - adiciona o relacionamento `Post.metrics`
- `backend/app/schemas/metric.py` - schemas Pydantic v2 de entrada, importação e resumo
- `backend/app/repositories/metrics.py` - queries SQLAlchemy 2.0 de gravação e agregação
- `backend/app/services/metrics_import.py` - parser de CSV com o módulo `csv` da biblioteca padrão
- `backend/app/routes/metrics.py` - as três rotas novas
- `backend/app/main.py` - registra o router de métricas
- `backend/app/db/database.py` - registra o novo módulo em `create_tables()`
- `backend/alembic/versions/0006_criar_post_metrics.py` - migração da tabela

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-12-modelo-metricas-post
```

**Passo 2 - Criar o modelo `PostMetric`**

Siga o mesmo padrão de `backend/app/models/post.py` e `backend/app/models/post_asset.py`: SQLAlchemy 2.0 com `Mapped` / `mapped_column`, docstring em português e comentários de seção.

Crie `backend/app/models/post_metric.py`:

```python
"""Modelo ORM da tabela post_metrics: desempenho de um post depois de publicado."""
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class PostMetric(Base):
    """Cada linha é uma coleta de métricas de um post em uma plataforma."""
    __tablename__ = "post_metrics"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # ── Plataforma ────────────────────────────────────────────────
    platform: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True,
        comment="linkedin | x"
    )

    # ── Números da publicação ─────────────────────────────────────
    impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    likes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    comments: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    shares: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # ── Coleta ────────────────────────────────────────────────────
    collected_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True,
        comment="Data e hora em que os números foram lidos na plataforma"
    )
    source: Mapped[str] = mapped_column(
        String(20), default="manual", nullable=False,
        comment="manual | import"
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # ── Relacionamento ────────────────────────────────────────────
    post: Mapped["Post"] = relationship("Post", back_populates="metrics")

    @property
    def engagement_rate(self) -> float:
        """(likes + comments + shares) / impressions. Retorna 0.0 sem impressões."""
        if not self.impressions:
            return 0.0
        return (self.likes + self.comments + self.shares) / self.impressions
```

**Passo 3 - Adicionar o relacionamento em `Post`**

Em `backend/app/models/post.py`, dentro do bloco `if TYPE_CHECKING:` acrescente `from app.models.post_metric import PostMetric` e, no final da classe, a nova seção:

```python
    # ── Métricas (PI 2) ───────────────────────────────────────────
    metrics: Mapped[list["PostMetric"]] = relationship(
        "PostMetric",
        back_populates="post",
        order_by="PostMetric.collected_at",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
```

Registre o módulo em `create_tables()`, em `backend/app/db/database.py`:

```python
    from app.models import source, post, generation, post_asset, post_metric  # noqa: F401
```

**Passo 4 - Criar os schemas Pydantic**

Crie `backend/app/schemas/metric.py`. O projeto usa Pydantic v2 com `model_config = {"from_attributes": True}` nos schemas de resposta.

```python
"""Schemas Pydantic das métricas de publicação."""
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

PLATAFORMAS = {"linkedin", "x"}
ORIGENS = {"manual", "import"}


class MetricCreate(BaseModel):
    platform: str
    impressions: int = Field(default=0, ge=0)
    likes: int = Field(default=0, ge=0)
    comments: int = Field(default=0, ge=0)
    shares: int = Field(default=0, ge=0)
    clicks: int = Field(default=0, ge=0)
    collected_at: datetime
    source: str = "manual"

    @field_validator("platform")
    @classmethod
    def validar_plataforma(cls, v: str) -> str:
        if v not in PLATAFORMAS:
            raise ValueError(f"platform deve ser um de: {', '.join(sorted(PLATAFORMAS))}")
        return v

    @field_validator("source")
    @classmethod
    def validar_origem(cls, v: str) -> str:
        if v not in ORIGENS:
            raise ValueError(f"source deve ser um de: {', '.join(sorted(ORIGENS))}")
        return v


class MetricResponse(MetricCreate):
    id: int
    post_id: int
    engagement_rate: float
    created_at: datetime

    model_config = {"from_attributes": True}


class LinhaComErro(BaseModel):
    """Erro de uma linha específica do CSV, para o usuário corrigir a planilha."""
    linha: int
    erro: str


class ImportResult(BaseModel):
    linhas_lidas: int
    importadas: int
    ignoradas: int
    erros: list[LinhaComErro]


class ContagemSemana(BaseModel):
    semana: str = Field(description="Formato ISO, ex: 2026-W36")
    publicados: int


class DiaFluxo(BaseModel):
    dia_semana: str
    publicados: int


class DiaEngajamento(BaseModel):
    dia_semana: str
    engagement_rate_medio: float


class HorarioEngajamento(BaseModel):
    hora: int = Field(ge=0, le=23)
    engagement_rate_medio: float


class ResumoPlataforma(BaseModel):
    platform: str
    posts: int
    impressions: int
    engagement_rate: float


class MetricsSummary(BaseModel):
    periodo_de: datetime | None
    periodo_ate: datetime | None
    total_publicados: int
    posts_por_semana: list[ContagemSemana]
    dia_maior_fluxo: DiaFluxo | None
    melhor_dia_engajamento: DiaEngajamento | None
    melhor_horario_engajamento: HorarioEngajamento | None
    engagement_rate: float
    por_plataforma: list[ResumoPlataforma]
```

**Passo 5 - Criar o repositório com as agregações**

Crie `backend/app/repositories/metrics.py`. As rotas nunca fazem query direta: elas chamam o repositório, como já acontece em `repositories/sources.py` e `repositories/posts.py`.

O agrupamento por dia da semana e por hora é feito em Python, e não em SQL, de propósito: o projeto roda em SQLite no desenvolvimento e em PostgreSQL no Supabase, e as funções de data dos dois bancos são diferentes (`strftime` contra `date_part`). Fazendo em Python o mesmo código funciona nos dois.

```python
"""Gravação e agregação das métricas de publicação."""
from collections import defaultdict
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.post import Post
from app.models.post_metric import PostMetric
from app.schemas.metric import MetricCreate

DIAS_SEMANA = [
    "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo",
]


def create(db: Session, post_id: int, data: MetricCreate) -> PostMetric:
    """Grava uma coleta de métricas para um post."""
    metric = PostMetric(post_id=post_id, **data.model_dump())
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


def get_ultima_por_post(db: Session, post_id: int, platform: str) -> PostMetric | None:
    """Retorna a coleta mais recente de um post em uma plataforma."""
    stmt = (
        select(PostMetric)
        .where(PostMetric.post_id == post_id, PostMetric.platform == platform)
        .order_by(PostMetric.collected_at.desc())
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none()


def _linhas_do_periodo(
    db: Session,
    date_from: datetime | None,
    date_to: datetime | None,
    platform: str | None,
) -> list[tuple[Post, PostMetric | None]]:
    """
    Retorna os posts publicados no período junto da coleta mais recente de cada um.
    Usa a última coleta porque coletas antigas do mesmo post inflariam a média.
    """
    stmt = select(Post).where(Post.status == "published", Post.published_at.is_not(None))
    if date_from:
        stmt = stmt.where(Post.published_at >= date_from)
    if date_to:
        stmt = stmt.where(Post.published_at <= date_to)

    posts = list(db.execute(stmt).scalars())

    pares: list[tuple[Post, PostMetric | None]] = []
    for post in posts:
        coletas = [m for m in post.metrics if not platform or m.platform == platform]
        if platform and not coletas:
            continue
        por_plataforma: dict[str, PostMetric] = {}
        for m in sorted(coletas, key=lambda x: x.collected_at):
            por_plataforma[m.platform] = m  # a última sobrescreve as anteriores
        if not por_plataforma:
            pares.append((post, None))
        for metric in por_plataforma.values():
            pares.append((post, metric))
    return pares


def _taxa(metricas: list[PostMetric]) -> float:
    """Taxa de engajamento agregada: (likes + comments + shares) / impressions."""
    impressoes = sum(m.impressions for m in metricas)
    if not impressoes:
        return 0.0
    interacoes = sum(m.likes + m.comments + m.shares for m in metricas)
    return round(interacoes / impressoes, 4)


def get_summary(
    db: Session,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    platform: str | None = None,
) -> dict:
    """Monta o resumo consumido pelo dashboard da issue PI2-13."""
    pares = _linhas_do_periodo(db, date_from, date_to, platform)

    posts_unicos = {p.id: p for p, _ in pares}
    metricas = [m for _, m in pares if m is not None]

    # ── Publicações por semana ISO ────────────────────────────────
    por_semana: dict[str, int] = defaultdict(int)
    for post in posts_unicos.values():
        ano, semana, _ = post.published_at.isocalendar()
        por_semana[f"{ano}-W{semana:02d}"] += 1

    # ── Dia da semana com maior fluxo de publicações ──────────────
    fluxo: dict[int, int] = defaultdict(int)
    for post in posts_unicos.values():
        fluxo[post.published_at.weekday()] += 1

    # ── Dia e horário com maior engajamento médio ─────────────────
    por_dia: dict[int, list[PostMetric]] = defaultdict(list)
    por_hora: dict[int, list[PostMetric]] = defaultdict(list)
    for post, metric in pares:
        if metric is None:
            continue
        por_dia[post.published_at.weekday()].append(metric)
        por_hora[post.published_at.hour].append(metric)

    melhor_dia = max(por_dia.items(), key=lambda kv: _taxa(kv[1]), default=None)
    melhor_hora = max(por_hora.items(), key=lambda kv: _taxa(kv[1]), default=None)
    dia_fluxo = max(fluxo.items(), key=lambda kv: kv[1], default=None)

    # ── Comparação entre plataformas ──────────────────────────────
    por_plataforma: dict[str, list[PostMetric]] = defaultdict(list)
    for metric in metricas:
        por_plataforma[metric.platform].append(metric)

    return {
        "periodo_de": date_from,
        "periodo_ate": date_to,
        "total_publicados": len(posts_unicos),
        "posts_por_semana": [
            {"semana": k, "publicados": v} for k, v in sorted(por_semana.items())
        ],
        "dia_maior_fluxo": (
            {"dia_semana": DIAS_SEMANA[dia_fluxo[0]], "publicados": dia_fluxo[1]}
            if dia_fluxo else None
        ),
        "melhor_dia_engajamento": (
            {
                "dia_semana": DIAS_SEMANA[melhor_dia[0]],
                "engagement_rate_medio": _taxa(melhor_dia[1]),
            }
            if melhor_dia else None
        ),
        "melhor_horario_engajamento": (
            {"hora": melhor_hora[0], "engagement_rate_medio": _taxa(melhor_hora[1])}
            if melhor_hora else None
        ),
        "engagement_rate": _taxa(metricas),
        "por_plataforma": [
            {
                "platform": nome,
                "posts": len(lista),
                "impressions": sum(m.impressions for m in lista),
                "engagement_rate": _taxa(lista),
            }
            for nome, lista in sorted(por_plataforma.items())
        ],
    }
```

**Passo 6 - Criar o parser de CSV**

Nada de pandas: use o módulo `csv` da biblioteca padrão, que já vem no Python. Cada linha inválida vira um erro com o número da linha, e as linhas boas continuam sendo importadas.

Crie `backend/app/services/metrics_import.py`:

```python
"""Importação de métricas a partir de um arquivo CSV enviado pelo usuário."""
import csv
import io
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.post import Post
from app.models.post_metric import PostMetric
from app.schemas.metric import PLATAFORMAS

COLUNAS_OBRIGATORIAS = [
    "post_id", "platform", "impressions", "likes",
    "comments", "shares", "clicks", "collected_at",
]


def _inteiro(valor: str, campo: str) -> int:
    """Converte para inteiro não negativo, aceitando célula vazia como zero."""
    texto = (valor or "").strip()
    if texto == "":
        return 0
    try:
        numero = int(float(texto))
    except ValueError:
        raise ValueError(f"{campo} deve ser um numero inteiro, recebido '{valor}'")
    if numero < 0:
        raise ValueError(f"{campo} nao pode ser negativo")
    return numero


def _data(valor: str) -> datetime:
    """Aceita ISO 8601 (2026-09-01T10:30:00) e o formato brasileiro 01/09/2026 10:30."""
    texto = (valor or "").strip()
    for formato in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y %H:%M", "%d/%m/%Y"):
        try:
            return datetime.strptime(texto, formato)
        except ValueError:
            continue
    raise ValueError(f"collected_at invalido: '{valor}'. Use 2026-09-01T10:30:00")


def importar_csv(db: Session, conteudo: bytes) -> dict:
    """Lê o CSV, valida linha a linha e grava as linhas válidas."""
    try:
        texto = conteudo.decode("utf-8-sig")
    except UnicodeDecodeError:
        texto = conteudo.decode("latin-1")

    leitor = csv.DictReader(io.StringIO(texto))
    cabecalho = [c.strip() for c in (leitor.fieldnames or [])]

    faltando = [c for c in COLUNAS_OBRIGATORIAS if c not in cabecalho]
    if faltando:
        raise ValueError(f"Colunas ausentes no CSV: {', '.join(faltando)}")

    erros: list[dict] = []
    novos: list[PostMetric] = []
    lidas = 0

    for numero, linha in enumerate(leitor, start=2):  # linha 1 é o cabeçalho
        lidas += 1
        try:
            post_id = _inteiro(linha["post_id"], "post_id")
            if not db.get(Post, post_id):
                raise ValueError(f"post_id {post_id} nao existe")

            plataforma = (linha["platform"] or "").strip().lower()
            if plataforma not in PLATAFORMAS:
                raise ValueError(f"platform deve ser um de: {', '.join(sorted(PLATAFORMAS))}")

            novos.append(PostMetric(
                post_id=post_id,
                platform=plataforma,
                impressions=_inteiro(linha["impressions"], "impressions"),
                likes=_inteiro(linha["likes"], "likes"),
                comments=_inteiro(linha["comments"], "comments"),
                shares=_inteiro(linha["shares"], "shares"),
                clicks=_inteiro(linha["clicks"], "clicks"),
                collected_at=_data(linha["collected_at"]),
                source="import",
            ))
        except ValueError as exc:
            erros.append({"linha": numero, "erro": str(exc)})

    if novos:
        db.add_all(novos)
        db.commit()

    return {
        "linhas_lidas": lidas,
        "importadas": len(novos),
        "ignoradas": len(erros),
        "erros": erros,
    }
```

**Passo 7 - Criar as rotas**

Crie `backend/app/routes/metrics.py`. As três rotas ficam no mesmo router, sem prefixo, porque uma delas mora abaixo de `/posts` e as outras duas abaixo de `/metrics`. Todas usam `Depends(get_current_admin)`, igual ao restante da API.

```python
"""Rotas de métricas de publicação (PI 2)."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import get_current_admin
from app.schemas.metric import MetricCreate, MetricResponse, ImportResult, MetricsSummary
from app.repositories import metrics as metric_repo
from app.repositories import posts as post_repo
from app.services.metrics_import import importar_csv

router = APIRouter()

TAMANHO_MAXIMO_CSV = 2 * 1024 * 1024  # 2 MB


@router.post("/posts/{post_id}/metrics", response_model=MetricResponse, status_code=201, tags=["Metrics"])
def registrar_metrica(
    post_id: int,
    data: MetricCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Registro manual: o usuário digita os números que leu no LinkedIn ou no X."""
    if not post_repo.get_by_id(db, post_id):
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return metric_repo.create(db, post_id, data)


@router.post("/metrics/import", response_model=ImportResult, tags=["Metrics"])
async def importar_metricas(
    file: UploadFile = File(..., description="CSV exportado da plataforma"),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Importa um CSV com as colunas post_id,platform,impressions,likes,comments,shares,clicks,collected_at."""
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(status_code=422, detail="Envie um arquivo .csv")

    conteudo = await file.read()
    if len(conteudo) > TAMANHO_MAXIMO_CSV:
        raise HTTPException(status_code=413, detail="Arquivo maior que 2 MB")

    try:
        return importar_csv(db, conteudo)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@router.get("/metrics/summary", response_model=MetricsSummary, tags=["Metrics"])
def resumo_metricas(
    date_from: datetime | None = Query(None, alias="from"),
    date_to: datetime | None = Query(None, alias="to"),
    platform: str | None = Query(None, pattern="^(linkedin|x)$"),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Resumo agregado usado pelo dashboard da issue PI2-13."""
    return metric_repo.get_summary(db, date_from=date_from, date_to=date_to, platform=platform)
```

**Passo 8 - Registrar o router no `main.py`**

Em `backend/app/main.py`, acrescente `metrics` ao import de rotas e registre o router sem prefixo, logo depois do de posts:

```python
from app.routes import auth, sources, posts, generation, automation, metrics
```

```python
app.include_router(metrics.router,    prefix="",            tags=["Metrics"])
```

**Passo 9 - Criar a migração**

```bash
cd backend
alembic heads
alembic revision -m "cria tabela post_metrics"
```

Renomeie o arquivo para `0006_criar_post_metrics.py`, ajuste `down_revision` para a revisão que o `alembic heads` mostrou e escreva:

```python
"""cria tabela post_metrics

Revision ID: 0006_criar_post_metrics
"""
from alembic import op
import sqlalchemy as sa

revision = "0006_criar_post_metrics"
down_revision = "0005_alt_text_obrigatorio"  # confira com: alembic heads
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "post_metrics",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("platform", sa.String(length=20), nullable=False),
        sa.Column("impressions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("likes", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("comments", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("shares", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("clicks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("collected_at", sa.DateTime(), nullable=False),
        sa.Column("source", sa.String(length=20), nullable=False, server_default="manual"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_post_metrics_post_id", "post_metrics", ["post_id"])
    op.create_index("ix_post_metrics_platform", "post_metrics", ["platform"])
    op.create_index("ix_post_metrics_collected_at", "post_metrics", ["collected_at"])


def downgrade() -> None:
    op.drop_index("ix_post_metrics_collected_at", table_name="post_metrics")
    op.drop_index("ix_post_metrics_platform", table_name="post_metrics")
    op.drop_index("ix_post_metrics_post_id", table_name="post_metrics")
    op.drop_table("post_metrics")
```

Aplique:

```bash
cd backend
alembic upgrade head
```

**Passo 10 - Testar na mão**

Suba a API, pegue o token em `POST /auth/login` e exercite as três rotas pelo Swagger em `http://localhost:8000/docs` ou pelos comandos do bloco "Exemplo de uso" abaixo.

**Passo 11 - Commit e Pull Request**

```bash
git add backend/app/models/post_metric.py backend/app/schemas/metric.py backend/app/repositories/metrics.py backend/app/services/metrics_import.py backend/app/routes/metrics.py backend/app/models/post.py backend/app/db/database.py backend/app/main.py backend/alembic/versions/0006_criar_post_metrics.py
git commit -m "feat(backend): cria modelo PostMetric e ingestao de metricas de publicacao

Adiciona a tabela post_metrics com plataforma, impressoes, curtidas,
comentarios, compartilhamentos, cliques e data da coleta. Cria as rotas
de registro manual, importacao de CSV com validacao por linha e o
resumo agregado com posts por semana, dia de maior fluxo, melhor dia e
melhor horario de engajamento e taxa de engajamento por plataforma."
git push -u origin feat/pi2-12-modelo-metricas-post
gh pr create --base main --title "[PI2][P1][Backend] Criar modelo PostMetric e ingestao de metricas de publicacao" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

Registro manual de uma coleta:

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha"}' | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

curl -X POST http://localhost:8000/posts/12/metrics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "platform": "linkedin",
        "impressions": 2400,
        "likes": 58,
        "comments": 11,
        "shares": 7,
        "clicks": 43,
        "collected_at": "2026-09-01T10:30:00"
      }'
```

```json
{
  "id": 1,
  "post_id": 12,
  "platform": "linkedin",
  "impressions": 2400,
  "likes": 58,
  "comments": 11,
  "shares": 7,
  "clicks": 43,
  "collected_at": "2026-09-01T10:30:00",
  "source": "manual",
  "engagement_rate": 0.0317,
  "created_at": "2026-09-02T14:02:11"
}
```

Importação de CSV com uma linha boa e uma linha ruim:

```bash
cat > metricas.csv <<'CSV'
post_id,platform,impressions,likes,comments,shares,clicks,collected_at
12,linkedin,2400,58,11,7,43,2026-09-01T10:30:00
99,tiktok,100,2,0,0,1,2026-09-01T10:30:00
CSV

curl -X POST http://localhost:8000/metrics/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@metricas.csv"
```

```json
{
  "linhas_lidas": 2,
  "importadas": 1,
  "ignoradas": 1,
  "erros": [
    { "linha": 3, "erro": "post_id 99 nao existe" }
  ]
}
```

Resumo do período:

```bash
curl -s "http://localhost:8000/metrics/summary?from=2026-08-01T00:00:00&to=2026-09-01T23:59:59" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "periodo_de": "2026-08-01T00:00:00",
  "periodo_ate": "2026-09-01T23:59:59",
  "total_publicados": 18,
  "posts_por_semana": [
    { "semana": "2026-W31", "publicados": 4 },
    { "semana": "2026-W32", "publicados": 5 },
    { "semana": "2026-W33", "publicados": 4 },
    { "semana": "2026-W34", "publicados": 5 }
  ],
  "dia_maior_fluxo": { "dia_semana": "terca", "publicados": 6 },
  "melhor_dia_engajamento": { "dia_semana": "quarta", "engagement_rate_medio": 0.0412 },
  "melhor_horario_engajamento": { "hora": 9, "engagement_rate_medio": 0.0455 },
  "engagement_rate": 0.0298,
  "por_plataforma": [
    { "platform": "linkedin", "posts": 12, "impressions": 28400, "engagement_rate": 0.0331 },
    { "platform": "x", "posts": 6, "impressions": 9100, "engagement_rate": 0.0189 }
  ]
}
```

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Migração aplica e reverte | `alembic upgrade head`, `alembic downgrade -1`, `alembic upgrade head` | 3 comandos com exit code 0 |
| Registro manual funciona | `POST /posts/{id}/metrics` com o corpo do exemplo | HTTP 201 e `engagement_rate` igual a 0.0317 |
| Taxa de engajamento correta | Post com 2400 impressões, 58 likes, 11 comentários, 7 shares | `(58+11+7)/2400 = 0.0317` com erro menor que 0.0001 |
| Importação parcial de CSV | Enviar o CSV do exemplo, com 1 linha válida e 1 inválida | `importadas: 1`, `ignoradas: 1` e o erro apontando a linha 3 |
| Validação de plataforma | `POST /posts/{id}/metrics` com `"platform": "tiktok"` | HTTP 422 |
| Tempo de resposta do resumo | `GET /metrics/summary` com 200 posts e 400 coletas no banco | menos de 500 ms |

## Definition of Done

- [ ] `backend/app/models/post_metric.py` criado no padrão `Mapped` / `mapped_column`
- [ ] `Post.metrics` declarado com `cascade="all, delete-orphan"`
- [ ] `create_tables()` importa `post_metric` e a revisão `0006_criar_post_metrics` sobe e desce sem erro
- [ ] As três rotas respondem no Swagger e todas exigem `get_current_admin`
- [ ] O parser usa apenas o módulo `csv` da biblioteca padrão e devolve o número da linha em cada erro
- [ ] `GET /metrics/summary` devolve posts por semana, dia de maior fluxo, melhor dia, melhor horário, taxa geral e a quebra por plataforma
- [ ] Saída dos comandos do "Exemplo de uso" colada no corpo do PR
- [ ] Nenhuma rota existente quebrada (`GET /posts/` e `GET /sources/` continuam respondendo 200)
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- FastAPI - Upload de arquivos: https://fastapi.tiangolo.com/tutorial/request-files/
- FastAPI - Parâmetros de query e validação: https://fastapi.tiangolo.com/tutorial/query-params-str-validations/
- Pydantic v2 - Validadores de campo: https://docs.pydantic.dev/latest/concepts/validators/
- SQLAlchemy 2.0 - `select()` e ORM query guide: https://docs.sqlalchemy.org/en/20/orm/queryguide/select.html
- Python - Módulo `csv` da biblioteca padrão: https://docs.python.org/3/library/csv.html
- Python - `datetime.isocalendar()`: https://docs.python.org/3/library/datetime.html#datetime.date.isocalendar
- LinkedIn - Métricas de análise de publicações: https://www.linkedin.com/help/linkedin/answer/a551152
- Documentação interna: `PI1/architecture.md` e `CLAUDE.md` na raiz do repositório
