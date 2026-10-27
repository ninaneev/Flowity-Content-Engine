"""publicação automática no LinkedIn: coluna linkedin_post_urn + view e RPCs para o Make/n8n

Revision ID: 7a3d9c2e4f15
Revises: 0007_carousel_slides
Create Date: 2026-10-22 21:00:00

Só adiciona coisas (nada é apagado nem alterado):
- posts.linkedin_post_urn (todos os bancos)
- no Postgres/Supabase:
  - view  public.posts_due_now           (somente leitura, para conferir o que vai sair)
  - rpc   public.claim_next_due_post()    (pega o próximo post vencido e marca 'publishing')
  - rpc   public.mark_posted(post_id, post_urn)
  - rpc   public.mark_post_failed(post_id, reason)

Regra de "pronto para publicar":
  status = 'scheduled' e channel = 'linkedin' e scheduled_at <= agora em America/Sao_Paulo
  e published_at is null e linkedin_post_urn is null
  e o post NÃO tem imagem em post_assets (as imagens ficam no disco do backend local,
  o Make não alcança; post com imagem continua manual para não sair sem a imagem).

scheduled_at é gravado sem fuso, com o horário de parede que a Nina escolhe na tela
(datetime-local do navegador, em São Paulo). Por isso a comparação usa
now() at time zone 'America/Sao_Paulo', e não UTC.

As funções só podem ser executadas pelo service_role (chave secreta do Supabase).
anon e authenticated perdem o acesso, porque a chave anon é pública.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7a3d9c2e4f15"
down_revision: Union[str, Sequence[str], None] = "0007_carousel_slides"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SCHEDULE_TZ = "America/Sao_Paulo"

# Mesmo filtro na view e na função de claim (a função trava a linha, por isso não lê da view)
DUE_FILTER = f"""
      {{a}}.status = 'scheduled'
  and {{a}}.channel = 'linkedin'
  and {{a}}.scheduled_at is not null
  and {{a}}.scheduled_at <= (now() at time zone '{SCHEDULE_TZ}')
  and {{a}}.published_at is null
  and {{a}}.linkedin_post_urn is null
  and not exists (select 1 from public.post_assets pa where pa.post_id = {{a}}.id)
"""

COMMENTARY = (
    "concat_ws(E'\\n\\n', nullif(btrim({a}.hook), ''), "
    "nullif(btrim({a}.body), ''), nullif(btrim({a}.cta), ''))"
)

UPGRADE_SQL = [
    f"""
create or replace view public.posts_due_now as
select p.id,
       p.scheduled_at,
       p.hook,
       {COMMENTARY.format(a='p')} as commentary
  from public.posts p
 where {DUE_FILTER.format(a='p')}
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
            where {DUE_FILTER.format(a='q')}
            order by q.scheduled_at, q.id
            limit 1
              for update skip locked
         )
  returning p.id::integer, {COMMENTARY.format(a='p')}, p.scheduled_at::timestamp;
$$
""",
    """
create or replace function public.mark_posted(post_id integer, post_urn text)
returns table (id integer, status text, published_at timestamp without time zone, linkedin_post_urn text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if post_urn is null or btrim(post_urn) = '' then
    raise exception 'post_urn is required';
  end if;
  return query
  update public.posts p
     set status = 'published',
         published_at = (now() at time zone 'utc'),
         linkedin_post_urn = btrim(post_urn),
         updated_at = now()
   where p.id = mark_posted.post_id
     and p.status in ('publishing', 'scheduled')
     and p.linkedin_post_urn is null
  returning p.id::integer, p.status::text, p.published_at::timestamp, p.linkedin_post_urn::text;
end;
$$
""",
    """
create or replace function public.mark_post_failed(post_id integer, reason text default null)
returns table (id integer, status text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  return query
  update public.posts p
     set status = 'failed',
         notes = concat_ws(E'\\n', p.notes, '[FALHA autopost] ' || coalesce(reason, 'sem motivo')),
         updated_at = now()
   where p.id = mark_post_failed.post_id
     and p.status = 'publishing'
  returning p.id::integer, p.status::text;
end;
$$
""",
    # Funções nascem executáveis por PUBLIC; tiramos isso de todo mundo
    "revoke all on function public.claim_next_due_post() from public",
    "revoke all on function public.mark_posted(integer, text) from public",
    "revoke all on function public.mark_post_failed(integer, text) from public",
    # Papéis do Supabase só existem lá; num Postgres comum este bloco não faz nada
    """
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.posts_due_now from anon;
    revoke all on function public.claim_next_due_post() from anon;
    revoke all on function public.mark_posted(integer, text) from anon;
    revoke all on function public.mark_post_failed(integer, text) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.posts_due_now from authenticated;
    revoke all on function public.claim_next_due_post() from authenticated;
    revoke all on function public.mark_posted(integer, text) from authenticated;
    revoke all on function public.mark_post_failed(integer, text) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant select on public.posts_due_now to service_role;
    grant execute on function public.claim_next_due_post() to service_role;
    grant execute on function public.mark_posted(integer, text) to service_role;
    grant execute on function public.mark_post_failed(integer, text) to service_role;
  end if;
end
$$
""",
    # Faz o PostgREST do Supabase enxergar as funções novas sem reiniciar
    "notify pgrst, 'reload schema'",
]

DOWNGRADE_SQL = [
    "drop function if exists public.mark_post_failed(integer, text)",
    "drop function if exists public.mark_posted(integer, text)",
    "drop function if exists public.claim_next_due_post()",
    "drop view if exists public.posts_due_now",
    "notify pgrst, 'reload schema'",
]


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    # batch_alter_table para funcionar também no SQLite local
    with op.batch_alter_table("posts") as batch:
        batch.add_column(sa.Column("linkedin_post_urn", sa.String(length=100), nullable=True))

    if _is_postgres():
        for statement in UPGRADE_SQL:
            op.execute(statement)


def downgrade() -> None:
    if _is_postgres():
        for statement in DOWNGRADE_SQL:
            op.execute(statement)

    with op.batch_alter_table("posts") as batch:
        batch.drop_column("linkedin_post_urn")
