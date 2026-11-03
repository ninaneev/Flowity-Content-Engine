"""artigos do flowity.ai e blog do ninaneev.github.io: claim que já entrega o arquivo pronto

Revision ID: 1b8e4f2a7c55
Revises: 0a7d5e2c9b31
Create Date: 2026-11-03 16:00:00

- claim_next_due_web_post(): pega o próximo post aprovado (scheduled) dos canais article ou blog cuja
  hora já passou, marca 'publishing' e devolve o repositório, o caminho e o conteúdo do arquivo .md
  (cabeçalho key: value entre ---, depois o corpo como está). O cenário do Make só faz o PUT no GitHub
  e chama mark_posted(post_id, page_url); se o GitHub falhar, mark_post_failed (0010).
- O slug vem da linha "slug: ..." do corpo. Post sem slug não sai (fica atrasado e ganha o ponto
  vermelho "missed" no app).
"""
from typing import Sequence, Union

from alembic import op


revision: str = "1b8e4f2a7c55"
down_revision: Union[str, Sequence[str], None] = "0a7d5e2c9b31"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SLUG = r"substring({a}.body from '(?n)^slug:\s*([a-z0-9-]+)\s*$')"
DIA_SP = "to_char((p.scheduled_at at time zone 'utc') at time zone 'America/Sao_Paulo', 'YYYY-MM-DD')"


def _imagem(campo: str) -> str:
    return (
        f"(select pa.{campo}::text from public.post_assets pa where pa.post_id = p.id "
        "order by pa.position, pa.id limit 1)"
    )


FUNCOES = [
    f"""
create or replace function public.claim_next_due_web_post()
returns table (id integer, channel text, slug text, repo text, path text, content text, page_url text)
language sql
security definer
set search_path = public
as $$
  with alvo as (
    update public.posts p
       set status = 'publishing',
           updated_at = now()
     where p.id = (
             select q.id
               from public.posts q
              where q.status = 'scheduled'
                and q.channel in ('article', 'blog')
                and q.scheduled_at is not null
                and q.scheduled_at <= (now() at time zone 'utc')
                and q.published_at is null
                and q.linkedin_post_urn is null
                and {SLUG.format(a='q')} is not null
              order by q.scheduled_at, q.id
              limit 1
                for update skip locked
           )
    returning p.*
  )
  select p.id::integer,
         p.channel::text,
         {SLUG.format(a='p')},
         case p.channel when 'article' then 'ninaneev/flowity-executive-hub'
                        else 'ninaneev/ninaneev.github.io' end,
         case p.channel when 'article' then 'src/next/content/journal/auto/' || {SLUG.format(a='p')} || '.md'
                        else 'blog/posts/' || {SLUG.format(a='p')} || '.md' end,
         concat_ws(E'\\n',
           '---',
           'slug: ' || {SLUG.format(a='p')},
           'channel: ' || p.channel,
           'date: ' || {DIA_SP},
           'pillar: ' || p.pillar,
           'title: ' || regexp_replace(btrim(p.hook), '\\s+', ' ', 'g'),
           'cover: ' || {_imagem('public_url')},
           'cover_alt: ' || regexp_replace(btrim({_imagem('alt_text')}), '\\s+', ' ', 'g'),
           '---',
           '',
           btrim(p.body)
         ) || E'\\n',
         case p.channel when 'article' then 'https://flowity.ai/journal/' || {SLUG.format(a='p')}
                        else 'https://ninaneev.github.io/blog/' || {SLUG.format(a='p')} || '.html' end
    from alvo p;
$$
""",
]

ASSINATURAS = ["claim_next_due_web_post()"]


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
    if _is_postgres():
        for sql in FUNCOES + _permissoes() + ["notify pgrst, 'reload schema'"]:
            op.execute(sql)


def downgrade() -> None:
    if _is_postgres():
        for assinatura in reversed(ASSINATURAS):
            op.execute(f"drop function if exists public.{assinatura}")
        op.execute("notify pgrst, 'reload schema'")
