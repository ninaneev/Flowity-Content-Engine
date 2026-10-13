"""Garante que a cadeia do Alembic sobe do zero e bate com os modelos.

Roda num SQLite temporário, sem depender do banco da aplicação:
    cd backend && python -m pytest tests/test_migracoes.py -v
"""
from pathlib import Path

import pytest
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import create_engine, inspect

from app.core.config import settings
from app.db import database
from app.db.database import Base
from app.models import generation, post, post_asset, post_metric, source  # noqa: F401

BACKEND = Path(__file__).resolve().parent.parent
BASELINE = "3f2b7c1d9a10"
TABELAS_BASELINE = {"sources", "posts", "post_sources", "generation_runs"}


@pytest.fixture
def alembic_cfg(tmp_path, monkeypatch):
    url = f"sqlite:///{(tmp_path / 'migracoes.db').as_posix()}"
    # o env.py do Alembic lê a URL de settings, então apontamos settings para o banco temporário
    monkeypatch.setattr(settings, "DATABASE_URL", url)
    cfg = Config(str(BACKEND / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND / "alembic"))
    return cfg, url


def _tabelas(url):
    return set(inspect(create_engine(url)).get_table_names())


def test_upgrade_downgrade_upgrade_do_zero(alembic_cfg):
    cfg, url = alembic_cfg
    command.upgrade(cfg, "head")
    assert TABELAS_BASELINE | {"post_assets", "post_metrics"} <= _tabelas(url)

    command.downgrade(cfg, "base")
    assert _tabelas(url) <= {"alembic_version"}

    command.upgrade(cfg, "head")
    assert TABELAS_BASELINE | {"post_assets", "post_metrics"} <= _tabelas(url)


def test_baseline_bate_com_os_modelos(alembic_cfg):
    cfg, url = alembic_cfg
    command.upgrade(cfg, "head")
    with create_engine(url).connect() as conn:
        diffs = compare_metadata(MigrationContext.configure(conn), Base.metadata)

    def toca_baseline(diff):
        texto = repr(diff)
        return any(f"'{t}'" in texto or f"<{t}>" in texto or f"ix_{t}_" in texto for t in TABELAS_BASELINE)

    assert [d for d in diffs if toca_baseline(d)] == []


def test_baseline_e_a_primeira_revisao(alembic_cfg):
    cfg, _ = alembic_cfg
    from alembic.script import ScriptDirectory

    script = ScriptDirectory.from_config(cfg)
    assert script.get_base() == BASELINE
    assert script.get_revision("89380bd00e80").down_revision == BASELINE


def test_create_tables_so_roda_no_sqlite(monkeypatch):
    monkeypatch.setattr(settings, "DATABASE_URL", "postgresql://u:p@localhost/x")
    assert database.create_tables() is False
