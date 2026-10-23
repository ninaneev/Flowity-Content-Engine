"""Publicação automática no LinkedIn (Make/n8n): coluna, view posts_due_now e RPCs.

A parte de SQLite roda sempre. A parte de Postgres precisa de um banco descartável:
    AUTOPOST_PG_URL=postgresql://postgres:test@localhost:5432/postgres python -m pytest tests/test_autopost_rpc.py -v
O teste cria e apaga um banco próprio (autopost_test) nesse servidor. Nunca aponte para o Supabase real.
"""
import os
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url

from app.core.config import settings

BACKEND = Path(__file__).resolve().parent.parent
REVISAO = "7a3d9c2e4f15"
PG_URL = os.environ.get("AUTOPOST_PG_URL")
SP = ZoneInfo("America/Sao_Paulo")


def _cfg(url, monkeypatch):
    monkeypatch.setattr(settings, "DATABASE_URL", url)
    cfg = Config(str(BACKEND / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND / "alembic"))
    return cfg


# ── SQLite: só a coluna ───────────────────────────────────────────


def test_sqlite_ganha_coluna_e_volta(tmp_path, monkeypatch):
    url = f"sqlite:///{(tmp_path / 'autopost.db').as_posix()}"
    cfg = _cfg(url, monkeypatch)
    command.upgrade(cfg, REVISAO)
    colunas = {c["name"] for c in inspect(create_engine(url)).get_columns("posts")}
    assert "linkedin_post_urn" in colunas

    command.downgrade(cfg, "-1")
    colunas = {c["name"] for c in inspect(create_engine(url)).get_columns("posts")}
    assert "linkedin_post_urn" not in colunas


def test_resposta_da_api_traz_o_urn(client):
    criado = client.post("/posts/", json={"hook": "Oi", "channel": "linkedin", "status": "draft"}).json()
    assert "linkedin_post_urn" in criado
    assert criado["linkedin_post_urn"] is None


# ── Postgres: view e RPCs ─────────────────────────────────────────

precisa_pg = pytest.mark.skipif(not PG_URL, reason="defina AUTOPOST_PG_URL para rodar contra um Postgres descartável")


@pytest.fixture(scope="module")
def pg_db():
    admin = create_engine(PG_URL, isolation_level="AUTOCOMMIT")
    nome = "autopost_test"
    with admin.connect() as conn:
        conn.execute(text(f"drop database if exists {nome}"))
        conn.execute(text(f"create database {nome}"))
        for papel in ("anon", "authenticated", "service_role"):
            existe = conn.execute(text("select 1 from pg_roles where rolname = :r"), {"r": papel}).scalar()
            if not existe:
                conn.execute(text(f"create role {papel} nologin"))
    url = make_url(PG_URL).set(database=nome).render_as_string(hide_password=False)
    yield url
    with admin.connect() as conn:
        conn.execute(text(f"drop database if exists {nome} with (force)"))


@pytest.fixture
def pg(pg_db, monkeypatch):
    cfg = _cfg(pg_db, monkeypatch)
    command.upgrade(cfg, "head")
    engine = create_engine(pg_db)
    with engine.begin() as conn:
        conn.execute(text("delete from posts"))
    yield engine
    engine.dispose()


def _agora_sp():
    return datetime.now(SP).replace(tzinfo=None, microsecond=0)


def _post(engine, quando, status="scheduled", channel="linkedin", hook="Gancho", body="Corpo", cta="CTA"):
    with engine.begin() as conn:
        return conn.execute(
            text(
                "insert into posts (hook, body, cta, channel, status, scheduled_at, created_at, updated_at) "
                "values (:h, :b, :c, :ch, :s, :q, now(), now()) returning id"
            ),
            {"h": hook, "b": body, "c": cta, "ch": channel, "s": status, "q": quando},
        ).scalar()


def _ids_vencidos(engine):
    with engine.connect() as conn:
        return [r[0] for r in conn.execute(text("select id from posts_due_now"))]


def _claim(engine):
    with engine.begin() as conn:
        return conn.execute(text("select * from claim_next_due_post()")).mappings().all()


@precisa_pg
def test_regra_de_pronto_para_publicar(pg):
    agora = _agora_sp()
    vencido = _post(pg, agora - timedelta(minutes=5))
    futuro = _post(pg, agora + timedelta(minutes=30))
    rascunho = _post(pg, agora - timedelta(minutes=5), status="draft")
    revisado = _post(pg, agora - timedelta(minutes=5), status="revised")
    outro_canal = _post(pg, agora - timedelta(minutes=5), channel="x")
    sem_data = _post(pg, None)
    assert _ids_vencidos(pg) == [vencido]
    assert {futuro, rascunho, revisado, outro_canal, sem_data}.isdisjoint(_ids_vencidos(pg))


@precisa_pg
def test_post_com_imagem_fica_manual(pg):
    pid = _post(pg, _agora_sp() - timedelta(minutes=5))
    with pg.begin() as conn:
        conn.execute(
            text("insert into post_assets (post_id, kind, position, file_path, mime_type, alt_text, created_at, updated_at) "
                 "values (:i, 'image', 0, 'x.png', 'image/png', 'alt', now(), now())"),
            {"i": pid},
        )
    assert pid not in _ids_vencidos(pg)
    assert _claim(pg) == []


@precisa_pg
def test_horario_e_de_sao_paulo_e_nao_utc(pg):
    # 1 minuto atrás no relógio UTC = cerca de 3 horas no futuro em São Paulo: não pode sair ainda
    utc_parede = datetime.utcnow().replace(microsecond=0) - timedelta(minutes=1)
    cedo = _post(pg, utc_parede)
    assert cedo not in _ids_vencidos(pg)


@precisa_pg
def test_texto_junta_gancho_corpo_e_cta(pg):
    _post(pg, _agora_sp() - timedelta(minutes=1), hook=" Gancho ", body="Corpo", cta=None)
    linha = _claim(pg)[0]
    assert linha["commentary"] == "Gancho\n\nCorpo"


@precisa_pg
def test_claim_pega_um_por_vez_o_mais_antigo_e_nao_repete(pg):
    agora = _agora_sp()
    novo = _post(pg, agora - timedelta(minutes=1))
    antigo = _post(pg, agora - timedelta(hours=2))
    assert [r["id"] for r in _claim(pg)] == [antigo]
    assert [r["id"] for r in _claim(pg)] == [novo]
    assert _claim(pg) == []
    with pg.connect() as conn:
        status = conn.execute(text("select status from posts where id = :i"), {"i": antigo}).scalar()
    assert status == "publishing"


@precisa_pg
def test_mark_posted_grava_urn_e_e_idempotente(pg):
    pid = _post(pg, _agora_sp() - timedelta(minutes=1))
    _claim(pg)
    urn = f"urn:li:share:{uuid.uuid4().int % 10**18}"
    with pg.begin() as conn:
        linha = conn.execute(text("select * from mark_posted(:i, :u)"), {"i": pid, "u": urn}).mappings().one()
    assert linha["status"] == "published"
    assert linha["linkedin_post_urn"] == urn
    assert linha["published_at"] is not None
    with pg.begin() as conn:
        de_novo = conn.execute(text("select * from mark_posted(:i, 'urn:li:share:2')"), {"i": pid}).all()
    assert de_novo == []
    assert pid not in _ids_vencidos(pg)


@precisa_pg
def test_mark_posted_exige_urn(pg):
    pid = _post(pg, _agora_sp() - timedelta(minutes=1))
    with pytest.raises(Exception, match="post_urn is required"):
        with pg.begin() as conn:
            conn.execute(text("select * from mark_posted(:i, '  ')"), {"i": pid})


@precisa_pg
def test_mark_post_failed_so_vale_para_publishing(pg):
    pid = _post(pg, _agora_sp() - timedelta(minutes=1))
    with pg.begin() as conn:
        assert conn.execute(text("select * from mark_post_failed(:i, 'x')"), {"i": pid}).all() == []
    _claim(pg)
    with pg.begin() as conn:
        linha = conn.execute(text("select * from mark_post_failed(:i, 'token expirado')"), {"i": pid}).mappings().one()
        notas = conn.execute(text("select notes from posts where id = :i"), {"i": pid}).scalar()
    assert linha["status"] == "failed"
    assert "token expirado" in notas


@precisa_pg
def test_so_service_role_executa(pg):
    _post(pg, _agora_sp() - timedelta(minutes=1))
    for papel in ("anon", "authenticated"):
        with pytest.raises(Exception, match="permission denied"):
            with pg.begin() as conn:
                conn.execute(text(f"set local role {papel}"))
                conn.execute(text("select * from claim_next_due_post()"))
        with pytest.raises(Exception, match="permission denied"):
            with pg.begin() as conn:
                conn.execute(text(f"set local role {papel}"))
                conn.execute(text("select * from posts_due_now"))
    with pg.begin() as conn:
        conn.execute(text("set local role service_role"))
        assert len(conn.execute(text("select * from posts_due_now")).all()) == 1
        assert len(conn.execute(text("select * from claim_next_due_post()")).all()) == 1


@precisa_pg
def test_downgrade_remove_tudo(pg, pg_db, monkeypatch):
    cfg = _cfg(pg_db, monkeypatch)
    command.downgrade(cfg, "-1")
    with pg.connect() as conn:
        assert conn.execute(text("select to_regclass('public.posts_due_now')")).scalar() is None
        assert conn.execute(text("select count(*) from pg_proc where proname in "
                                 "('claim_next_due_post','mark_posted','mark_post_failed')")).scalar() == 0
    assert "linkedin_post_urn" not in {c["name"] for c in inspect(pg).get_columns("posts")}
    command.upgrade(cfg, "head")
