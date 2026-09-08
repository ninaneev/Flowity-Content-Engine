"""Cria o schema inicial e a tabela post_assets.

Revision ID: 0001_criar_post_assets
Revises:
Create Date: 2026-09-08
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_criar_post_assets"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Cria o baseline do banco e os assets de posts."""
    op.create_table(
        "sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("source_type", sa.String(length=50), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("theme", sa.String(length=100), nullable=True),
        sa.Column("audience", sa.String(length=100), nullable=True),
        sa.Column("origin", sa.String(length=255), nullable=True),
        sa.Column("tags_json", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_sources_id", "sources", ["id"], unique=False)

    op.create_table(
        "posts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hook", sa.String(length=280), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("cta", sa.String(length=280), nullable=True),
        sa.Column("short_x", sa.String(length=280), nullable=True),
        sa.Column("alt_title", sa.String(length=280), nullable=True),
        sa.Column("channel", sa.String(length=20), nullable=False, server_default="linkedin"),
        sa.Column("tone", sa.String(length=50), nullable=True),
        sa.Column("objective", sa.String(length=100), nullable=True),
        sa.Column("format", sa.String(length=50), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="idea"),
        sa.Column("scheduled_at", sa.DateTime(), nullable=True),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("generation_mode", sa.String(length=20), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_posts_id", "posts", ["id"], unique=False)

    op.create_table(
        "post_sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_post_sources_id", "post_sources", ["id"], unique=False)
    op.create_index("ix_post_sources_post_id", "post_sources", ["post_id"], unique=False)
    op.create_index("ix_post_sources_source_id", "post_sources", ["source_id"], unique=False)

    op.create_table(
        "generation_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=True),
        sa.Column("prompt_used", sa.Text(), nullable=True),
        sa.Column("model_used", sa.String(length=100), nullable=True),
        sa.Column("mode", sa.String(length=20), nullable=False),
        sa.Column("raw_output", sa.Text(), nullable=True),
        sa.Column("parsed_hook", sa.String(length=280), nullable=True),
        sa.Column("parsed_body", sa.Text(), nullable=True),
        sa.Column("parsed_cta", sa.String(length=280), nullable=True),
        sa.Column("parsed_short_x", sa.String(length=280), nullable=True),
        sa.Column("token_estimate", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="complete"),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True
        ),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_generation_runs_id", "generation_runs", ["id"], unique=False)

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
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True
        ),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_post_assets_id", "post_assets", ["id"], unique=False)
    op.create_index("ix_post_assets_post_id", "post_assets", ["post_id"], unique=False)
    op.create_index(
        "ix_post_assets_post_position",
        "post_assets",
        ["post_id", "position"],
        unique=False,
    )


def downgrade() -> None:
    """Remove o baseline e a tabela de assets."""
    op.drop_index("ix_post_assets_post_position", table_name="post_assets")
    op.drop_index("ix_post_assets_post_id", table_name="post_assets")
    op.drop_index("ix_post_assets_id", table_name="post_assets")
    op.drop_table("post_assets")

    op.drop_index("ix_generation_runs_id", table_name="generation_runs")
    op.drop_table("generation_runs")

    op.drop_index("ix_post_sources_source_id", table_name="post_sources")
    op.drop_index("ix_post_sources_post_id", table_name="post_sources")
    op.drop_index("ix_post_sources_id", table_name="post_sources")
    op.drop_table("post_sources")

    op.drop_index("ix_posts_id", table_name="posts")
    op.drop_table("posts")

    op.drop_index("ix_sources_id", table_name="sources")
    op.drop_table("sources")
