"""Página da Flowity (linkedin_company): claim próprio, repost no perfil e o fluxo "To approve".

As partes de Postgres usam o mesmo banco descartável de test_autopost_rpc.py (AUTOPOST_PG_URL).
"""
from datetime import timedelta

from sqlalchemy import text

from tests.test_autopost_rpc import _agora, _claim, _post, pg, pg_db, precisa_pg  # noqa: F401


def _claim_company(engine):
    with engine.begin() as conn:
        return conn.execute(text("select * from claim_next_due_company_post()")).mappings().all()


def _sql(engine, sql, **params):
    with engine.begin() as conn:
        return conn.execute(text(sql), params).mappings().all()


@precisa_pg
def test_cada_cenario_pega_so_o_seu_canal(pg):
    agora = _agora()
    pessoal = _post(pg, agora - timedelta(minutes=5))
    empresa = _post(pg, agora - timedelta(minutes=5), channel="linkedin_company")
    aprovar = _post(pg, agora - timedelta(minutes=5), channel="linkedin_company", status="to_approve")

    assert [r["id"] for r in _claim_company(pg)] == [empresa]
    assert _claim_company(pg) == []  # o "to_approve" nunca sai sem aprovação
    assert [r["id"] for r in _claim(pg)] == [pessoal]
    assert _sql(pg, "select status from posts where id = :i", i=aprovar)[0]["status"] == "to_approve"


@precisa_pg
def test_repost_pega_o_post_da_pagina_de_hoje_uma_vez(pg):
    agora = _agora()
    pid = _post(pg, agora - timedelta(hours=2), channel="linkedin_company")
    _claim_company(pg)
    _sql(pg, "select * from mark_posted(:i, 'urn:li:share:123')", i=pid)

    primeiro = _sql(pg, "select * from claim_next_reshare()")
    assert [(r["id"], r["post_urn"]) for r in primeiro] == [(pid, "urn:li:share:123")]
    assert _sql(pg, "select * from claim_next_reshare()") == []

    _sql(pg, "select * from mark_reshared(:i, 'urn:li:share:999')", i=pid)
    assert _sql(pg, "select reshare_urn from posts where id = :i", i=pid)[0]["reshare_urn"] == "urn:li:share:999"


@precisa_pg
def test_repost_que_falha_registra_o_motivo(pg):
    agora = _agora()
    pid = _post(pg, agora - timedelta(hours=2), channel="linkedin_company")
    _claim_company(pg)
    _sql(pg, "select * from mark_posted(:i, 'urn:li:share:1')", i=pid)
    _sql(pg, "select * from claim_next_reshare()")
    _sql(pg, "select * from mark_reshare_failed(:i, 'token')", i=pid)
    linha = _sql(pg, "select reshared_at, notes from posts where id = :i", i=pid)[0]
    assert linha["reshared_at"] is None
    assert "[FALHA repost] token" in linha["notes"]


@precisa_pg
def test_post_pessoal_nunca_e_repostado(pg):
    agora = _agora()
    pid = _post(pg, agora - timedelta(hours=2))
    _claim(pg)
    _sql(pg, "select * from mark_posted(:i, 'urn:li:share:5')", i=pid)
    assert _sql(pg, "select * from claim_next_reshare()") == []


# ── API: aprovação e canais manuais ───────────────────────────────


def test_post_para_aprovar_com_data_nao_agenda_sozinho(client):
    r = client.post("/posts/", json={"hook": "Proposta", "channel": "linkedin_company", "status": "to_approve",
                                     "pillar": "company_method", "scheduled_at": "2030-03-04T13:00:00Z"})
    assert r.status_code == 201, r.text
    assert r.json()["status"] == "to_approve"
    cal = client.get("/posts/calendar", params={"month": "2030-03"}).json()
    assert [p["status"] for p in cal] == ["to_approve"]

    aprovado = client.patch(f"/posts/{r.json()['id']}", json={"status": "scheduled"}).json()
    assert aprovado["status"] == "scheduled"


def test_marcar_publicado_registra_quando_saiu(client):
    pid = client.post("/posts/", json={"hook": "Tweet", "channel": "x", "scheduled_at": "2030-03-05T13:00:00Z"}).json()["id"]
    r = client.patch(f"/posts/{pid}", json={"status": "published"}).json()
    assert r["status"] == "published"
    assert r["published_at"] is not None


def test_canais_e_pilares_novos(client):
    for canal in ("linkedin_company", "article", "blog", "newsletter", "x"):
        assert client.post("/posts/", json={"hook": canal, "channel": canal}).status_code == 201
    assert client.post("/posts/", json={"hook": "?", "channel": "tiktok"}).status_code == 422
    assert client.post("/posts/", json={"hook": "p", "pillar": "company_trust"}).status_code == 201


def test_ideia_na_biblioteca(client):
    r = client.post("/sources/", json={"title": "Autopost travado", "source_type": "ideia",
                                       "content": "O token do LinkedIn caiu e o post ficou preso.",
                                       "origin": "Sessão Claude 2026-11-03: autopost"})
    assert r.status_code in (200, 201), r.text
    assert r.json()["source_type"] == "ideia"
