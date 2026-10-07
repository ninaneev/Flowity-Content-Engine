"""baseline: cria sources, posts, post_sources e generation_runs

Estas quatro tabelas existiam desde o PI 1 e eram criadas apenas pelo
Base.metadata.create_all() no startup da API. Sem esta revisao, um PostgreSQL
novo nao consegue rodar `alembic upgrade head`, porque a 0001 (post_assets)
tem FK para posts.id e nenhuma migracao criava a tabela posts.

As colunas espelham exatamente os modelos em app/models/source.py,
app/models/post.py e app/models/generation.py.

Banco que ja tem estas tabelas (ex.: Supabase do PI 1): NAO rode o upgrade
desta revisao; marque-a como aplicada com `alembic stamp 3f2b7c1d9a10` e
depois rode `alembic upgrade head`.

Revision ID: 3f2b7c1d9a10
Revises:
Create Date: 2026-09-22 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3f2b7c1d9a10"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── sources ──────────────────────────────────────────────────────────────
    op.create_table(
        "sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column(
            "source_type",
            sa.String(length=50),
            nullable=False,
            comment="post_antigo | insight | frase | objecao | dor | trecho | comentario | newsletter | referencia",
        ),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("theme", sa.String(length=100), nullable=True),
        sa.Column("audience", sa.String(length=100), nullable=True),
        sa.Column("origin", sa.String(length=255), nullable=True),
        sa.Column(
            "tags_json",
            sa.Text(),
            nullable=True,
            comment='JSON array de tags, ex: ["ia","saas"]',
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sources_id"), "sources", ["id"], unique=False)

    # ── posts ────────────────────────────────────────────────────────────────
    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hook", sa.String(length=280), nullable=False, comment="Título/gancho do post"),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("cta", sa.String(length=280), nullable=True, comment="Call to action"),
        sa.Column("short_x", sa.String(length=280), nullable=True, comment="Versão curta para X/Twitter"),
        sa.Column("alt_title", sa.String(length=280), nullable=True, comment="Título alternativo"),
        sa.Column("channel", sa.String(length=20), nullable=False, comment="linkedin | x | newsletter"),
        sa.Column(
            "tone",
            sa.String(length=50),
            nullable=True,
            comment="estratégico | educativo | inspiracional | direto",
        ),
        sa.Column("objective", sa.String(length=100), nullable=True),
        sa.Column("format", sa.String(length=50), nullable=True, comment="lista | narrativa | pergunta | dado"),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            comment="idea | draft | revised | scheduled | publishing | published | failed",
        ),
        sa.Column("scheduled_at", sa.DateTime(), nullable=True),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("generation_mode", sa.String(length=20), nullable=True, comment="template | ollama | manual"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_posts_id"), "posts", ["id"], unique=False)

    # ── post_sources ─────────────────────────────────────────────────────────
    op.create_table(
        "post_sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_post_sources_id"), "post_sources", ["id"], unique=False)
    op.create_index(op.f("ix_post_sources_post_id"), "post_sources", ["post_id"], unique=False)
    op.create_index(op.f("ix_post_sources_source_id"), "post_sources", ["source_id"], unique=False)

    # ── generation_runs ──────────────────────────────────────────────────────
    op.create_table(
        "generation_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=True),
        sa.Column("prompt_used", sa.Text(), nullable=True),
        sa.Column("model_used", sa.String(length=100), nullable=True),
        sa.Column("mode", sa.String(length=20), nullable=False, comment="template | ollama"),
        sa.Column("raw_output", sa.Text(), nullable=True),
        sa.Column("parsed_hook", sa.String(length=280), nullable=True),
        sa.Column("parsed_body", sa.Text(), nullable=True),
        sa.Column("parsed_cta", sa.String(length=280), nullable=True),
        sa.Column("parsed_short_x", sa.String(length=280), nullable=True),
        sa.Column("token_estimate", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, comment="pending | complete | failed"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_generation_runs_id"), "generation_runs", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_generation_runs_id"), table_name="generation_runs")
    op.drop_table("generation_runs")
    op.drop_index(op.f("ix_post_sources_source_id"), table_name="post_sources")
    op.drop_index(op.f("ix_post_sources_post_id"), table_name="post_sources")
    op.drop_index(op.f("ix_post_sources_id"), table_name="post_sources")
    op.drop_table("post_sources")
    op.drop_index(op.f("ix_posts_id"), table_name="posts")
    op.drop_table("posts")
    op.drop_index(op.f("ix_sources_id"), table_name="sources")
    op.drop_table("sources")
