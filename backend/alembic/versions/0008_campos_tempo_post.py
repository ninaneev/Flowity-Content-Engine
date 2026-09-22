"""adiciona campos de medicao de tempo em posts

Revision ID: 9e4b2f6a1c83
Revises: ab51b67c9eb3
Create Date: 2026-09-22 11:30:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9e4b2f6a1c83"
down_revision: Union[str, Sequence[str], None] = "ab51b67c9eb3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # batch_alter_table para funcionar também no SQLite local
    with op.batch_alter_table("posts") as batch:
        batch.add_column(sa.Column("external_minutes", sa.Integer(), nullable=True))
        batch.add_column(sa.Column("tools_used", sa.String(length=200), nullable=True))
        batch.add_column(sa.Column("workflow", sa.String(length=20), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("posts") as batch:
        batch.drop_column("workflow")
        batch.drop_column("tools_used")
        batch.drop_column("external_minutes")
