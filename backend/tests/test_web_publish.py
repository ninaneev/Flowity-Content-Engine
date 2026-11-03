"""Artigos (flowity.ai) e blog (ninaneev.github.io): claim_next_due_web_post entrega o arquivo pronto.

Usa o mesmo banco descartável de test_autopost_rpc.py (AUTOPOST_PG_URL).
"""
from datetime import timedelta

from sqlalchemy import text

from tests.test_autopost_rpc import _agora, _claim, _post, pg, pg_db, precisa_pg  # noqa: F401

ARTIGO = "===en===\ntitle: What is a signal\nsummary: A definition.\nslug: what-is-a-signal\n\nBody.\n\n===pt===\ntitle: O que é\nslug: what-is-a-signal\n\nCorpo."
BLOG = "slug: ai-answer-checklist\nsummary: Six boxes.\n\n## The checklist\n\n- [ ] One"


def _claim_web(engine):
    with engine.begin() as conn:
        return conn.execute(text("select * from claim_next_due_web_post()")).mappings().all()


def _sql(engine, sql, **params):
    with engine.begin() as conn:
        return conn.execute(text(sql), params).mappings().all()


@precisa_pg
def test_artigo_vencido_sai_com_repo_caminho_e_arquivo(pg):
    pid = _post(pg, _agora() - timedelta(minutes=5), channel="article", hook="What is a signal", body=ARTIGO)
    [r] = _claim_web(pg)
    assert r["id"] == pid
    assert r["slug"] == "what-is-a-signal"
    assert r["repo"] == "ninaneev/flowity-executive-hub"
    assert r["path"] == "src/next/content/journal/auto/what-is-a-signal.md"
    assert r["page_url"] == "https://flowity.ai/journal/what-is-a-signal"
    assert r["content"].startswith("---\nslug: what-is-a-signal\nchannel: article\ndate: ")
    assert "title: What is a signal\n---\n\n===en===" in r["content"]
    assert _sql(pg, "select status from posts where id = :i", i=pid)[0]["status"] == "publishing"
    assert _claim_web(pg) == []

    _sql(pg, "select * from mark_posted(:i, :u)", i=pid, u=r["page_url"])
    assert _sql(pg, "select status from posts where id = :i", i=pid)[0]["status"] == "published"


@precisa_pg
def test_blog_vai_para_o_github_io(pg):
    _post(pg, _agora() - timedelta(minutes=5), channel="blog", hook="Free: checklist", body=BLOG)
    [r] = _claim_web(pg)
    assert r["repo"] == "ninaneev/ninaneev.github.io"
    assert r["path"] == "blog/posts/ai-answer-checklist.md"
    assert r["page_url"] == "https://ninaneev.github.io/blog/ai-answer-checklist.html"


@precisa_pg
def test_so_sai_o_que_esta_aprovado_vencido_e_tem_slug(pg):
    agora = _agora()
    _post(pg, agora + timedelta(hours=2), channel="article", body=ARTIGO)  # ainda não é hora
    _post(pg, agora - timedelta(minutes=5), channel="article", status="to_approve", body=ARTIGO)
    _post(pg, agora - timedelta(minutes=5), channel="blog", body="sem slug")
    _post(pg, agora - timedelta(minutes=5), channel="newsletter", body=BLOG)  # manual
    assert _claim_web(pg) == []


@precisa_pg
def test_claims_do_linkedin_nao_pegam_artigos(pg):
    _post(pg, _agora() - timedelta(minutes=5), channel="article", body=ARTIGO)
    assert _claim(pg) == []
