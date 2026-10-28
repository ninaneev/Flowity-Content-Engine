"""adiciona posts.pillar (pilar de conteúdo do calendário)

Revision ID: c4f8a2e6d913
Revises: 8b4e1d6f3a27
Create Date: 2026-10-28 10:00:00

Coluna nova e nula: a view posts_due_now e o claim_next_due_post() da 0010/0011 listam colunas
explicitamente, então não mudam. Valores: workflow | proof | build | pov | story.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4f8a2e6d913"
down_revision: Union[str, Sequence[str], None] = "8b4e1d6f3a27"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # batch_alter_table para funcionar também no SQLite local
    with op.batch_alter_table("posts") as batch:
        batch.add_column(sa.Column("pillar", sa.String(length=30), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("posts") as batch:
        batch.drop_column("pillar")
