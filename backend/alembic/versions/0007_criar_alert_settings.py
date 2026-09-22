"""cria tabela alert_settings

Revision ID: 5c1e7a9d2b40
Revises: ab51b67c9eb3
Create Date: 2026-09-22 11:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5c1e7a9d2b40"
down_revision: Union[str, Sequence[str], None] = "ab51b67c9eb3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "alert_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("min_engagement_rate", sa.Float(), nullable=False, server_default="0.02"),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("alert_settings")
