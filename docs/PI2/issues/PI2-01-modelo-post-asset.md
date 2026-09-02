<!-- TITLE: [PI2][P0][Backend] Criar modelo PostAsset e migração para imagens do post -->
<!-- LABELS: area:backend,prio:p0,sprint:pi2,type:task -->

## Contexto (PI 2)

No PI 1 o Flowity Content Engine entregou um motor de conteúdo apenas textual: biblioteca de sources, gerador de posts e calendário mensal. Nenhum post consegue carregar imagem, e por isso o LinkedIn recebe publicações sem carrossel e sem card visual, que é justamente o formato de maior alcance. Esta issue cria a fundação de dados do PI 2: a tabela `post_assets`, que guarda cada arquivo de imagem ligado a um post, sua ordem dentro do carrossel e o texto alternativo obrigatório. Sem esta tabela nenhuma das issues PI2-02, PI2-03, PI2-04 e PI2-05 pode começar.

## Integrante responsável

Davi Corrêa Bueno

## Branch

`feat/pi2-01-modelo-post-asset`

## Estimativa

4 a 6 horas

## Arquivos que você vai criar ou editar

- `backend/app/models/post_asset.py` - novo modelo ORM `PostAsset` (tabela `post_assets`)
- `backend/app/models/post.py` - adiciona o relacionamento `Post.assets`
- `backend/app/db/database.py` - registra o novo módulo em `create_tables()`
- `backend/alembic.ini` - configuração do Alembic (criada pelo `alembic init`)
- `backend/alembic/env.py` - aponta o `target_metadata` para `Base.metadata`
- `backend/alembic/versions/0001_criar_post_assets.py` - migração com o `upgrade()` e o `downgrade()`

## Passo a passo

**Passo 1 - Criar a branch**

```bash
git checkout main
git pull origin main
git checkout -b feat/pi2-01-modelo-post-asset
```

**Passo 2 - Criar o modelo `PostAsset`**

O projeto usa SQLAlchemy 2.0 no estilo `Mapped` / `mapped_column`, com docstring em português e comentários de seção. Siga exatamente o padrão de `backend/app/models/post.py`.

Crie `backend/app/models/post_asset.py`:

```python
"""Modelo ORM da tabela post_assets: imagens e slides de carrossel de um post."""
from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class PostAsset(Base):
    """Cada linha é um arquivo de imagem pertencente a um post."""
    __tablename__ = "post_assets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # ── Tipo e ordem ──────────────────────────────────────────────
    kind: Mapped[str] = mapped_column(
        String(20), default="image", nullable=False,
        comment="image | carousel_slide"
    )
    position: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False,
        comment="Ordem do slide dentro do carrossel, começando em 0"
    )

    # ── Arquivo ───────────────────────────────────────────────────
    file_path: Mapped[str] = mapped_column(
        String(500), nullable=False,
        comment="Caminho relativo dentro de MEDIA_DIR"
    )
    mime_type: Mapped[str] = mapped_column(
        String(50), nullable=False,
        comment="image/png | image/jpeg | image/webp"
    )
    width: Mapped[int | None] = mapped_column(Integer, comment="Largura em pixels")
    height: Mapped[int | None] = mapped_column(Integer, comment="Altura em pixels")
    size_bytes: Mapped[int | None] = mapped_column(Integer, comment="Tamanho do arquivo em bytes")

    # ── Acessibilidade ────────────────────────────────────────────
    alt_text: Mapped[str] = mapped_column(
        Text, nullable=False,
        comment="Texto alternativo obrigatório (WCAG 2.1 AA, critério 1.1.1)"
    )
    caption: Mapped[str | None] = mapped_column(
        String(500), comment="Legenda visível opcional"
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # ── Relacionamento ────────────────────────────────────────────
    post: Mapped["Post"] = relationship("Post", back_populates="assets")
```

Atenção: `alt_text` é `nullable=False` de propósito. O banco é a primeira barreira de acessibilidade; a validação de conteúdo do texto vem depois, na issue PI2-05.

**Passo 3 - Adicionar o relacionamento em `Post`**

Edite `backend/app/models/post.py`. Troque a linha de import do ORM e acrescente a seção de relacionamento no final da classe:

```python
from sqlalchemy.orm import Mapped, mapped_column, relationship
```

```python
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # ── Mídia (PI 2) ──────────────────────────────────────────────
    assets: Mapped[list["PostAsset"]] = relationship(
        "PostAsset",
        back_populates="post",
        order_by="PostAsset.position",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
```

Acrescente também, no topo do arquivo, o import necessário apenas para checagem de tipos:

```python
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.post_asset import PostAsset
```

**Passo 4 - Registrar o modelo no `create_tables()`**

Em `backend/app/db/database.py`, dentro de `create_tables()`, inclua o novo módulo para que o SQLAlchemy conheça a tabela:

```python
def create_tables():
    """Cria todas as tabelas no banco. Chamado no startup da API."""
    from app.models import source, post, generation, post_asset  # noqa: F401 - garante que os modelos são registrados
    Base.metadata.create_all(bind=engine)
```

**Passo 5 - Inicializar o Alembic**

O `alembic==1.13.3` já está no `backend/requirements.txt`, mas a pasta de migrações ainda não existe no repositório. Rode uma única vez, a partir de `backend/`:

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
alembic init alembic
```

**Passo 6 - Configurar `alembic/env.py`**

Substitua o bloco de configuração para ler a `DATABASE_URL` do projeto e apontar o metadata:

```python
from app.core.config import settings
from app.db.database import Base
from app.models import source, post, generation, post_asset  # noqa: F401

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata
```

**Passo 7 - Gerar a migração**

```bash
cd backend
alembic revision -m "cria tabela post_assets"
```

Renomeie o arquivo gerado em `alembic/versions/` para `0001_criar_post_assets.py` e escreva o corpo:

```python
"""cria tabela post_assets

Revision ID: 0001_criar_post_assets
Revises:
Create Date: 2026-09-02
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_criar_post_assets"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "post_assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("kind", sa.String(length=20), nullable=False, server_default="image"),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("file_path", sa.String(length=500), nullable=False),
        sa.Column("mime_type", sa.String(length=50), nullable=False),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=True),
        sa.Column("alt_text", sa.Text(), nullable=False),
        sa.Column("caption", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_post_assets_post_id", "post_assets", ["post_id"])
    op.create_index("ix_post_assets_post_position", "post_assets", ["post_id", "position"])


def downgrade() -> None:
    op.drop_index("ix_post_assets_post_position", table_name="post_assets")
    op.drop_index("ix_post_assets_post_id", table_name="post_assets")
    op.drop_table("post_assets")
```

**Passo 8 - Aplicar e conferir**

```bash
cd backend
alembic upgrade head
python -c "import sqlite3; c=sqlite3.connect('flowity.db'); print(c.execute('PRAGMA table_info(post_assets)').fetchall())"
```

Teste o relacionamento no shell do Python:

```bash
cd backend
python -c "
from app.db.database import SessionLocal
from app.models.post import Post
from app.models.post_asset import PostAsset
db = SessionLocal()
p = Post(hook='Teste PI2', channel='linkedin', status='draft')
db.add(p); db.flush()
db.add(PostAsset(post_id=p.id, kind='carousel_slide', position=1, file_path='a.png', mime_type='image/png', alt_text='Slide 2 do carrossel de teste'))
db.add(PostAsset(post_id=p.id, kind='carousel_slide', position=0, file_path='b.png', mime_type='image/png', alt_text='Slide 1 do carrossel de teste'))
db.commit(); db.refresh(p)
print([a.position for a in p.assets])
db.delete(p); db.commit()
print('cascade ok:', db.query(PostAsset).filter(PostAsset.post_id==p.id).count())
"
```

**Passo 9 - Commit e Pull Request**

```bash
git add backend/app/models/post_asset.py backend/app/models/post.py backend/app/db/database.py backend/alembic.ini backend/alembic/
git commit -m "feat(backend): cria modelo PostAsset e migracao da tabela post_assets

Adiciona a tabela post_assets com kind, position, file_path, mime_type,
dimensoes, alt_text obrigatorio e caption. Cria o relacionamento
Post.assets ordenado por position com cascade delete e configura o
Alembic com a primeira revisao do PI 2."
git push -u origin feat/pi2-01-modelo-post-asset
gh pr create --base main --title "[PI2][P0][Backend] Criar modelo PostAsset e migracao para imagens do post" --body "Closes #<numero-da-issue>"
```

## Exemplo de uso

Saída esperada do teste do Passo 8:

```text
[(0, 'id', 'INTEGER', 1, None, 1), (1, 'post_id', 'INTEGER', 1, None, 0), (2, 'kind', 'VARCHAR(20)', 1, "'image'", 0), (3, 'position', 'INTEGER', 1, '0', 0), (4, 'file_path', 'VARCHAR(500)', 1, None, 0), (5, 'mime_type', 'VARCHAR(50)', 1, None, 0), (6, 'width', 'INTEGER', 0, None, 0), (7, 'height', 'INTEGER', 0, None, 0), (8, 'size_bytes', 'INTEGER', 0, None, 0), (9, 'alt_text', 'TEXT', 1, None, 0), (10, 'caption', 'VARCHAR(500)', 0, None, 0), (11, 'created_at', 'DATETIME', 1, 'now()', 0), (12, 'updated_at', 'DATETIME', 1, 'now()', 0)]
[0, 1]
cascade ok: 0
```

Os assets voltam ordenados por `position` e somem junto com o post, que é exatamente o comportamento que o carrossel da issue PI2-04 espera.

## Critérios de medição de sucesso

| Métrica | Como medir | Meta |
|---|---|---|
| Migração aplica e reverte sem erro | `alembic upgrade head` seguido de `alembic downgrade -1` e `alembic upgrade head` | 3 comandos com exit code 0 |
| Colunas criadas | `PRAGMA table_info(post_assets)` | 13 colunas, `alt_text` com notnull = 1 |
| Ordenação do relacionamento | Inserir slides em posições 2, 0, 1 e ler `post.assets` | Lista retorna `[0, 1, 2]` |
| Cascata de exclusão | Apagar o post e contar assets órfãos | 0 registros restantes |
| API sobe sem regressão | `docker compose up backend` e `GET /health` | HTTP 200 e log de startup sem exceção |

## Definition of Done

- [ ] `backend/app/models/post_asset.py` criado seguindo o padrão `Mapped` / `mapped_column` do projeto
- [ ] `Post.assets` declarado com `order_by="PostAsset.position"` e `cascade="all, delete-orphan"`
- [ ] `create_tables()` importa `post_asset`
- [ ] Alembic inicializado com `env.py` lendo `settings.DATABASE_URL`
- [ ] Revisão `0001_criar_post_assets` com `upgrade()` e `downgrade()` funcionando nos dois sentidos
- [ ] Teste manual do Passo 8 executado com a saída registrada no PR
- [ ] Nenhuma rota existente quebrada (`GET /posts/` continua respondendo 200)
- [ ] Pull Request aberto com `Closes #<numero-da-issue>`

## Referências

- SQLAlchemy 2.0 - Declarative com anotações: https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html
- SQLAlchemy 2.0 - `relationship()` e `order_by`: https://docs.sqlalchemy.org/en/20/orm/relationship_api.html
- SQLAlchemy 2.0 - Cascatas: https://docs.sqlalchemy.org/en/20/orm/cascades.html
- Alembic - Tutorial e operações: https://alembic.sqlalchemy.org/en/latest/tutorial.html
- Alembic - `op.create_table`: https://alembic.sqlalchemy.org/en/latest/ops.html
- WCAG 2.1 - Critério 1.1.1 Conteúdo não textual: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html
- Documentação interna: `docs/PI1/architecture.md` e `docs/PI1/supabase-setup.md`
