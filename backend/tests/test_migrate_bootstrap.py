"""Testa app/db/migrate.py: leva ao head um banco criado sem Alembic (caso do Supabase do PI 1).

Roda num SQLite temporário:
    cd backend && python -m pytest tests/test_migrate_bootstrap.py -v
"""
from pathlib import Path

import pytest
from alembic import command
from alembic.script import ScriptDirectory
from sqlalchemy import create_engine, inspect, text

from app.core.config import settings
from app.db import migrate

HEAD_TABELAS = {"sources", "posts", "post_sources", "generation_runs", "post_assets", "post_metrics", "alert_settings"}


@pytest.fixture
def banco(tmp_path, monkeypatch):
    url = f"sqlite:///{(tmp_path / 'bootstrap.db').as_posix()}"
    monkeypatch.setattr(settings, "DATABASE_URL", url)
    engine = create_engine(url)
    yield migrate.alembic_config(), engine
    engine.dispose()


def _head(cfg):
    return ScriptDirectory.from_config(cfg).get_current_head()


def _sem_alembic(engine):
    """Simula um banco criado fora do Alembic: as tabelas ficam, o alembic_version some."""
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE alembic_version"))


def _tabelas(engine):
    return set(inspect(engine).get_table_names())


def test_marcadores_cobrem_toda_a_cadeia(banco):
    cfg, _ = banco
    script = ScriptDirectory.from_config(cfg)
    cadeia = [rev.revision for rev in reversed(list(script.walk_revisions()))]
    assert [rev for rev, _ in migrate.MARCADORES] == cadeia


def test_banco_vazio_sobe_tudo(banco):
    cfg, engine = banco
    resultado = migrate.migrar(cfg, engine)
    assert resultado["carimbada"] is None
    assert resultado["depois"] == _head(cfg)
    assert HEAD_TABELAS <= _tabelas(engine)


def test_banco_do_pi1_sem_alembic_ganha_post_assets(banco):
    """O caso real: Supabase com as 4 tabelas do PI 1 e sem alembic_version."""
    cfg, engine = banco
    command.upgrade(cfg, "3f2b7c1d9a10")
    with engine.begin() as conn:
        conn.execute(text("INSERT INTO posts (hook, channel, status) VALUES ('gancho', 'linkedin', 'draft')"))
    _sem_alembic(engine)
    assert "post_assets" not in _tabelas(engine)

    resultado = migrate.migrar(cfg, engine)

    assert resultado["antes"] is None
    assert resultado["carimbada"] == "3f2b7c1d9a10"
    assert resultado["depois"] == _head(cfg)
    assert HEAD_TABELAS <= _tabelas(engine)
    colunas = {c["name"] for c in inspect(engine).get_columns("posts")}
    assert {"external_minutes", "tools_used", "workflow"} <= colunas
    with engine.connect() as conn:
        assert conn.execute(text("SELECT count(*) FROM posts")).scalar() == 1  # dados preservados


def test_banco_com_post_assets_criada_fora_do_alembic(banco):
    cfg, engine = banco
    command.upgrade(cfg, "89380bd00e80")
    _sem_alembic(engine)
    resultado = migrate.migrar(cfg, engine)
    assert resultado["carimbada"] == "89380bd00e80"
    assert resultado["depois"] == _head(cfg)


def test_banco_ja_no_head_nao_muda(banco):
    cfg, engine = banco
    command.upgrade(cfg, "head")
    resultado = migrate.migrar(cfg, engine)
    assert resultado == {"antes": _head(cfg), "carimbada": None, "depois": _head(cfg)}


def test_banco_com_alembic_no_meio_so_aplica_o_resto(banco):
    cfg, engine = banco
    command.upgrade(cfg, "ab51b67c9eb3")
    resultado = migrate.migrar(cfg, engine)
    assert resultado["antes"] == "ab51b67c9eb3"
    assert resultado["carimbada"] is None
    assert resultado["depois"] == _head(cfg)


def test_revisao_fora_de_ordem_para_sem_mexer(banco):
    cfg, engine = banco
    command.upgrade(cfg, "head")
    _sem_alembic(engine)
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE post_assets"))
    with pytest.raises(migrate.EstadoInconsistente):
        migrate.migrar(cfg, engine)
    assert migrate.revisao_atual(engine) is None
    assert "post_assets" not in _tabelas(engine)


def test_baseline_pela_metade_para_sem_mexer(banco):
    cfg, engine = banco
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE sources (id INTEGER PRIMARY KEY)"))
    with pytest.raises(migrate.EstadoInconsistente):
        migrate.migrar(cfg, engine)
    assert _tabelas(engine) == {"sources"}


def test_main_ignora_sqlite(monkeypatch, capsys):
    monkeypatch.setattr(settings, "DATABASE_URL", "sqlite://")
    assert migrate.main() == 0
    assert "SQLite" in capsys.readouterr().out


def test_caminho_do_alembic_ini_existe():
    assert (migrate.BACKEND / "alembic.ini").is_file()
    assert Path(migrate.alembic_config().get_main_option("script_location")).is_dir()
