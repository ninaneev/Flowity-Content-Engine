"""autopost: rodar o Make publica o próximo post agendado do dia, sem esperar a hora

Revision ID: e2b7f4a9c816
Revises: d7a1c3e9b524
Create Date: 2026-10-28 05:00:00

Nina: apertar Run no Make tem que publicar o próximo post agendado, seja qual for a hora.
O dia continua valendo: entra o que está agendado até o fim de hoje no horário de São Paulo
(e o que ficou para trás), nunca um post de amanhã. Quem decide a hora em que sai é o
agendamento do cenário no Make (ex.: dias úteis às 11:01).
Só troca o limite de tempo na view e no claim (create or replace, mesma assinatura e mesmos
grants da 0013). O downgrade volta para scheduled_at <= now().
"""
from typing import Sequence, Union

from alembic import op


revision: str = "e2b7f4a9c816"
down_revision: Union[str, Sequence[str], None] = "d7a1c3e9b524"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

COMMENTARY = (
    "concat_ws(E'\\n\\n', nullif(btrim({a}.hook), ''), "
    "nullif(btrim({a}.body), ''), nullif(btrim({a}.cta), ''))"
)

# Meia-noite de amanhã em São Paulo, como timestamptz
FIM_DE_HOJE = (
    "((date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day')"
    " at time zone 'America/Sao_Paulo')"
)


def _due_filter(a: str, limite: str) -> str:
    return f"""
      {a}.status = 'scheduled'
  and {a}.channel = 'linkedin'
  and {a}.scheduled_at is not null
  and {a}.scheduled_at {limite}
  and {a}.published_at is null
  and {a}.linkedin_post_urn is null
  and (select count(*) from public.post_assets pa where pa.post_id = {a}.id) <= 1
  and not exists (
        select 1 from public.post_assets pa
         where pa.post_id = {a}.id
           and (pa.kind <> 'image' or pa.public_url is null)
      )
"""


def _imagem(a: str, campo: str) -> str:
    return (
        f"(select pa.{campo}::text from public.post_assets pa where pa.post_id = {a}.id "
        "order by pa.position, pa.id limit 1)"
    )


def _sql(limite: str) -> list[str]:
    return [
        f"""
create or replace view public.posts_due_now as
select p.id,
       p.scheduled_at,
       p.hook,
       {COMMENTARY.format(a='p')} as commentary,
       {_imagem('p', 'public_url')} as image_url,
       {_imagem('p', 'mime_type')} as image_mime
  from public.posts p
 where {_due_filter('p', limite)}
 order by p.scheduled_at, p.id
""",
        f"""
create or replace function public.claim_next_due_post()
returns table (id integer, commentary text, scheduled_at timestamp without time zone,
               image_url text, image_mime text)
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
            where {_due_filter('q', limite)}
            order by q.scheduled_at, q.id
            limit 1
              for update skip locked
         )
  returning p.id::integer, {COMMENTARY.format(a='p')}, p.scheduled_at::timestamp,
            {_imagem('p', 'public_url')}, {_imagem('p', 'mime_type')};
$$
""",
        "notify pgrst, 'reload schema'",
    ]


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    if _is_postgres():
        for statement in _sql(f"< {FIM_DE_HOJE}"):
            op.execute(statement)


def downgrade() -> None:
    if _is_postgres():
        for statement in _sql("<= now()"):
            op.execute(statement)
