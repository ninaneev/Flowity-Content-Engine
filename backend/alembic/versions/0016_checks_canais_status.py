"""checks do banco: canais novos, status to_approve e tipo de fonte "ideia"

Revision ID: 0a7d5e2c9b31
Revises: f3c9a1b7d260
Create Date: 2026-11-03 13:50:00

O banco do Supabase tem CHECKs criados à mão no setup antigo (docs/supabase-setup.md), fora do
Alembic. Eles recusavam linkedin_company, article, blog, to_approve e ideia. Esta revisão recria os
três com os valores atuais. Num banco criado só pelo Alembic eles não existem: o drop é "if exists".
"""
from typing import Sequence, Union

from alembic import op


revision: str = "0a7d5e2c9b31"
down_revision: Union[str, Sequence[str], None] = "f3c9a1b7d260"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CHANNELS = ["linkedin", "linkedin_company", "x", "newsletter", "article", "blog"]
STATUSES = ["idea", "draft", "revised", "to_approve", "scheduled", "publishing", "published", "failed"]
SOURCE_TYPES = ["post_antigo", "insight", "frase", "objecao", "dor", "trecho", "comentario", "newsletter",
                "referencia", "ideia"]

OLD_CHANNELS = ["linkedin", "x", "newsletter"]
OLD_STATUSES = ["idea", "draft", "revised", "scheduled", "publishing", "published", "failed"]
OLD_SOURCE_TYPES = SOURCE_TYPES[:-1]


def _lista(valores: list[str]) -> str:
    return ", ".join(f"'{v}'" for v in valores)


def _recriar(channels, statuses, source_types) -> None:
    op.execute("alter table public.posts drop constraint if exists posts_channel_check")
    op.execute(f"alter table public.posts add constraint posts_channel_check check (channel in ({_lista(channels)}))")
    op.execute("alter table public.posts drop constraint if exists posts_status_check")
    op.execute(f"alter table public.posts add constraint posts_status_check check (status in ({_lista(statuses)}))")
    op.execute("alter table public.sources drop constraint if exists sources_source_type_check")
    op.execute(
        "alter table public.sources add constraint sources_source_type_check "
        f"check (source_type in ({_lista(source_types)}))"
    )


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    if _is_postgres():
        _recriar(CHANNELS, STATUSES, SOURCE_TYPES)


def downgrade() -> None:
    if _is_postgres():
        _recriar(OLD_CHANNELS, OLD_STATUSES, OLD_SOURCE_TYPES)
