"""página da Flowity no LinkedIn: claim próprio e repost no perfil da Nina no mesmo dia

Revision ID: f3c9a1b7d260
Revises: e2b7f4a9c816
Create Date: 2026-11-03 13:00:00

- claim_next_due_company_post(): igual ao claim do perfil (0014), mas só canal linkedin_company.
  O cenário da página roda seg/qua/sex de manhã e só publica se o dia tiver post aprovado.
- claim_next_reshare(): pega o post da página publicado hoje (horário de São Paulo) que ainda não
  foi repostado e marca reshared_at, para o cenário da tarde repostar no perfil da Nina.
- mark_reshared(post_id, new_urn) / mark_reshare_failed(post_id, reason).
mark_posted e mark_post_failed (0010) já servem para os dois canais.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "f3c9a1b7d260"
down_revision: Union[str, Sequence[str], None] = "e2b7f4a9c816"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

COMMENTARY = (
    "concat_ws(E'\\n\\n', nullif(btrim(p.hook), ''), "
    "nullif(btrim(p.body), ''), nullif(btrim(p.cta), ''))"
)
FIM_DE_HOJE = (
    "((date_trunc('day', now() at time zone 'America/Sao_Paulo') + interval '1 day')"
    " at time zone 'America/Sao_Paulo')"
)
INICIO_DE_HOJE = "(date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')"


def _imagem(campo: str) -> str:
    return (
        f"(select pa.{campo}::text from public.post_assets pa where pa.post_id = p.id "
        "order by pa.position, pa.id limit 1)"
    )


FUNCOES = [
    f"""
create or replace function public.claim_next_due_company_post()
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
            where q.status = 'scheduled'
              and q.channel = 'linkedin_company'
              and q.scheduled_at is not null
              and q.scheduled_at < {FIM_DE_HOJE}
              and q.published_at is null
              and q.linkedin_post_urn is null
              and (select count(*) from public.post_assets pa where pa.post_id = q.id) <= 1
              and not exists (
                    select 1 from public.post_assets pa
                     where pa.post_id = q.id
                       and (pa.kind <> 'image' or pa.public_url is null)
                  )
            order by q.scheduled_at, q.id
            limit 1
              for update skip locked
         )
  returning p.id::integer, {COMMENTARY}, p.scheduled_at::timestamp,
            {_imagem('public_url')}, {_imagem('mime_type')};
$$
""",
    f"""
create or replace function public.claim_next_reshare()
returns table (id integer, post_urn text)
language sql
security definer
set search_path = public
as $$
  update public.posts p
     set reshared_at = now(),
         updated_at = now()
   where p.id = (
           select q.id
             from public.posts q
            where q.channel = 'linkedin_company'
              and q.status = 'published'
              and q.linkedin_post_urn is not null
              and q.reshared_at is null
              and q.published_at >= {INICIO_DE_HOJE}
            order by q.published_at, q.id
            limit 1
              for update skip locked
         )
  returning p.id::integer, p.linkedin_post_urn::text;
$$
""",
    """
create or replace function public.mark_reshared(post_id integer, new_urn text)
returns table (id integer, reshare_urn text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  return query
  update public.posts p
     set reshare_urn = nullif(btrim(mark_reshared.new_urn), ''),
         updated_at = now()
   where p.id = mark_reshared.post_id
     and p.reshared_at is not null
  returning p.id::integer, p.reshare_urn::text;
end;
$$
""",
    """
create or replace function public.mark_reshare_failed(post_id integer, reason text default null)
returns table (id integer)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  return query
  update public.posts p
     set reshared_at = null,
         notes = concat_ws(E'\\n', p.notes, '[FALHA repost] ' || coalesce(reason, 'sem motivo')),
         updated_at = now()
   where p.id = mark_reshare_failed.post_id
     and p.reshare_urn is null
  returning p.id::integer;
end;
$$
""",
]

ASSINATURAS = [
    "claim_next_due_company_post()",
    "claim_next_reshare()",
    "mark_reshared(integer, text)",
    "mark_reshare_failed(integer, text)",
]


def _permissoes() -> list[str]:
    revogar_public = [f"revoke all on function public.{a} from public" for a in ASSINATURAS]
    linhas_anon = "\n".join(f"    revoke all on function public.{a} from anon;" for a in ASSINATURAS)
    linhas_auth = "\n".join(f"    revoke all on function public.{a} from authenticated;" for a in ASSINATURAS)
    linhas_service = "\n".join(f"    grant execute on function public.{a} to service_role;" for a in ASSINATURAS)
    # Papéis do Supabase só existem lá; num Postgres comum este bloco não faz nada
    bloco = f"""
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
{linhas_anon}
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
{linhas_auth}
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
{linhas_service}
  end if;
end
$$
"""
    return revogar_public + [bloco]


def _is_postgres() -> bool:
    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    op.add_column("posts", sa.Column("reshare_urn", sa.String(255), nullable=True))
    op.add_column("posts", sa.Column("reshared_at", sa.DateTime(timezone=True), nullable=True))
    if _is_postgres():
        for sql in FUNCOES + _permissoes() + ["notify pgrst, 'reload schema'"]:
            op.execute(sql)


def downgrade() -> None:
    if _is_postgres():
        for assinatura in reversed(ASSINATURAS):
            op.execute(f"drop function if exists public.{assinatura}")
        op.execute("notify pgrst, 'reload schema'")
    op.drop_column("posts", "reshared_at")
    op.drop_column("posts", "reshare_urn")
