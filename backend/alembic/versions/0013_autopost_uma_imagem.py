"""autopost com uma imagem: post_assets.public_url + view/claim devolvem image_url e image_mime

Revision ID: d7a1c3e9b524
Revises: c4f8a2e6d913
Create Date: 2026-10-28 14:00:00

- post_assets.public_url (todos os bancos): URL pública da imagem no Supabase Storage.
- no Postgres/Supabase, posts_due_now e claim_next_due_post() passam a aceitar post com
  0 assets OU exatamente 1 imagem (kind = 'image') com public_url preenchida.
  2+ imagens, slide de carrossel ou imagem sem public_url continuam fora (manual).
  As duas ganham image_url e image_mime (null quando não há imagem). O tipo de retorno da
  função muda, então view e função são apagadas e recriadas, com os mesmos grants da 0010
  (só service_role; anon e authenticated sem acesso). A trava 'publishing' e o
  scheduled_at <= now() da 0011 continuam iguais.
O downgrade volta a view e a função da 0011 e remove a coluna.
"""
import importlib.util
from pathlib import Path
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d7a1c3e9b524"
down_revision: Union[str, Sequence[str], None] = "c4f8a2e6d913"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

COMMENTARY = (
    "concat_ws(E'\\n\\n', nullif(btrim({a}.hook), ''), "
    "nullif(btrim({a}.body), ''), nullif(btrim({a}.cta), ''))"
)


def _due_filter(a: str) -> str:
    return f"""
      {a}.status = 'scheduled'
  and {a}.channel = 'linkedin'
  and {a}.scheduled_at is not null
  and {a}.scheduled_at <= now()
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


DROP_SQL = [
    "drop function if exists public.claim_next_due_post()",
    "drop view if exists public.posts_due_now",
]

UPGRADE_SQL = [
    f"""
create view public.posts_due_now as
select p.id,
       p.scheduled_at,
       p.hook,
       {COMMENTARY.format(a='p')} as commentary,
       {_imagem('p', 'public_url')} as image_url,
       {_imagem('p', 'mime_type')} as image_mime
  from public.posts p
 where {_due_filter('p')}
 order by p.scheduled_at, p.id
""",
    f"""
create function public.claim_next_due_post()
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
            where {_due_filter('q')}
            order by q.scheduled_at, q.id
            limit 1
              for update skip locked
         )
  returning p.id::integer, {COMMENTARY.format(a='p')}, p.scheduled_at::timestamp,
            {_imagem('p', 'public_url')}, {_imagem('p', 'mime_type')};
$$
""",
]

# Mesmos grants da 0010 para a view e o claim (recriados perdem os grants antigos)
GRANTS_SQL = [
    "revoke all on function public.claim_next_due_post() from public",
    """
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.posts_due_now from anon;
    revoke all on function public.claim_next_due_post() from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.posts_due_now from authenticated;
    revoke all on function public.claim_next_due_post() from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant select on public.posts_due_now to service_role;
    grant execute on function public.claim_next_due_post() to service_role;
  end if;
end
$$
""",
    "notify pgrst, 'reload schema'",
]


def _sql_da_0011() -> list[str]:
    """Reaproveita o SQL da 0011 no downgrade, para não ter duas cópias divergentes."""
    caminho = Path(__file__).with_name("0011_autopost_due_utc.py")
    spec = importlib.util.spec_from_file_location("autopost_0011", caminho)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return [s for s in modulo._sql("now()") if "notify pgrst" not in s]


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    # batch_alter_table para funcionar também no SQLite local
    with op.batch_alter_table("post_assets") as batch:
        batch.add_column(sa.Column("public_url", sa.String(length=1000), nullable=True))

    if _is_postgres():
        for statement in DROP_SQL + UPGRADE_SQL + GRANTS_SQL:
            op.execute(statement)


def downgrade() -> None:
    if _is_postgres():
        for statement in DROP_SQL + _sql_da_0011() + GRANTS_SQL:
            op.execute(statement)

    with op.batch_alter_table("post_assets") as batch:
        batch.drop_column("public_url")
