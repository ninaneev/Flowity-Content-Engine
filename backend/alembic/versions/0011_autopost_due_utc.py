"""autopost: comparar scheduled_at (timestamptz) com now() em vez de hora de parede de São Paulo

Revision ID: 8b4e1d6f3a27
Revises: 7a3d9c2e4f15
Create Date: 2026-10-27 18:30:00

A coluna posts.scheduled_at é timestamptz e o Supabase roda em UTC. A 0010 comparava com
(now() at time zone 'America/Sao_Paulo'), que é um timestamp sem fuso lido como UTC, então um
post marcado para 11:00 BRT (14:00Z) só ficava vencido às 14:00 BRT, 3 horas atrasado.
Aqui a view e o claim passam a comparar com now(). Só recria objetos (create or replace),
sem mudar colunas nem dados.
"""
from typing import Sequence, Union

from alembic import op


revision: str = "8b4e1d6f3a27"
down_revision: Union[str, Sequence[str], None] = "7a3d9c2e4f15"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

COMMENTARY = (
    "concat_ws(E'\\n\\n', nullif(btrim({a}.hook), ''), "
    "nullif(btrim({a}.body), ''), nullif(btrim({a}.cta), ''))"
)


def _due_filter(a: str, agora: str) -> str:
    return f"""
      {a}.status = 'scheduled'
  and {a}.channel = 'linkedin'
  and {a}.scheduled_at is not null
  and {a}.scheduled_at <= {agora}
  and {a}.published_at is null
  and {a}.linkedin_post_urn is null
  and not exists (select 1 from public.post_assets pa where pa.post_id = {a}.id)
"""


def _sql(agora: str) -> list[str]:
    return [
        f"""
create or replace view public.posts_due_now as
select p.id,
       p.scheduled_at,
       p.hook,
       {COMMENTARY.format(a='p')} as commentary
  from public.posts p
 where {_due_filter('p', agora)}
 order by p.scheduled_at, p.id
""",
        f"""
create or replace function public.claim_next_due_post()
returns table (id integer, commentary text, scheduled_at timestamp without time zone)
language sql
security definer
set search_path = public
as $$
  update public.posts p
     set status = 'publishing',
         updated_at = now()
   where p.id = (
           select q.id
             from public.posts q
            where {_due_filter('q', agora)}
            order by q.scheduled_at, q.id
            limit 1
              for update skip locked
         )
  returning p.id::integer, {COMMENTARY.format(a='p')}, p.scheduled_at::timestamp;
$$
""",
        "notify pgrst, 'reload schema'",
    ]


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    if _is_postgres():
        for statement in _sql("now()"):
            op.execute(statement)


def downgrade() -> None:
    if _is_postgres():
        for statement in _sql("(now() at time zone 'America/Sao_Paulo')"):
            op.execute(statement)
