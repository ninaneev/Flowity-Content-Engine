"""status "archived": post tirado do pipeline ativo sem ser apagado

Revision ID: 2c4a9d7e1f80
Revises: 1b8e4f2a7c55
Create Date: 2026-11-18 15:00:00

Só recria o CHECK posts_status_check (criado à mão no Supabase, refeito em 0016) com "archived".
Os claims do autopost (0010-0017) só pegam status = 'scheduled', então um post arquivado nunca sai.
"""
from typing import Sequence, Union

from alembic import op


revision: str = "2c4a9d7e1f80"
down_revision: Union[str, Sequence[str], None] = "1b8e4f2a7c55"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

OLD_STATUSES = ["idea", "draft", "revised", "to_approve", "scheduled", "publishing", "published", "failed"]
STATUSES = OLD_STATUSES + ["archived"]


def _recriar(statuses) -> None:
    lista = ", ".join(f"'{s}'" for s in statuses)
    op.execute("alter table public.posts drop constraint if exists posts_status_check")
    op.execute(f"alter table public.posts add constraint posts_status_check check (status in ({lista}))")


def upgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        _recriar(STATUSES)


def downgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        _recriar(OLD_STATUSES)
