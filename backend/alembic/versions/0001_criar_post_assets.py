"""cria tabela post_assets

Revision ID: 89380bd00e80
Revises: 
Create Date: 2026-09-09 13:12:51.983681

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '89380bd00e80'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "post_assets",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("post_id", sa.Integer(), nullable=False),
        sa.Column(
            "kind",
            sa.String(length=20),
            nullable=False,
            server_default="image",
        ),
        sa.Column(
            "position",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "file_path",
            sa.String(length=500),
            nullable=False,
        ),
        sa.Column(
            "mime_type",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=True),
        sa.Column("alt_text", sa.Text(), nullable=False),
        sa.Column(
            "caption",
            sa.String(length=500),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["post_id"],
            ["posts.id"],
            ondelete="CASCADE",
        ),
    )

    op.create_index(
        "ix_post_assets_post_id",
        "post_assets",
        ["post_id"],
    )

    op.create_index(
        "ix_post_assets_post_position",
        "post_assets",
        ["post_id", "position"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_post_assets_post_position",
        table_name="post_assets",
    )

    op.drop_index(
        "ix_post_assets_post_id",
        table_name="post_assets",
    )

    op.drop_table("post_assets")