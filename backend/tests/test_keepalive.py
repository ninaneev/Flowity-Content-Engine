"""Testa app/db/keepalive.py (leitura que mantém o Supabase gratuito acordado)."""
from datetime import datetime, timedelta
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text

from app.db import keepalive

RAIZ = Path(__file__).resolve().parents[2]


def test_normaliza_postgres_url():
    assert keepalive.normalizar_url("postgres://u:p@h:5432/db") == "postgresql://u:p@h:5432/db"
    assert keepalive.normalizar_url("postgresql://u:p@h/db") == "postgresql://u:p@h/db"


def test_pinga_e_conta_posts(tmp_path):
    url = f"sqlite:///{(tmp_path / 'k.db').as_posix()}"
    with create_engine(url).begin() as conn:
        conn.execute(text("CREATE TABLE posts (id INTEGER PRIMARY KEY)"))
        conn.execute(text("INSERT INTO posts (id) VALUES (1), (2)"))
    assert keepalive.pingar(url) == 2


def test_sem_url_sai_com_2(monkeypatch, capsys):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    assert keepalive.main() == 2
    assert "SUPABASE_DATABASE_URL" in capsys.readouterr().err


def test_falha_de_conexao_sai_com_1(monkeypatch, capsys):
    monkeypatch.setenv("DATABASE_URL", "postgresql://u:p@127.0.0.1:1/nada")
    assert keepalive.main() == 1
    erro = capsys.readouterr().err
    assert "Restore" in erro
    assert "u:p" not in erro  # nunca imprime a URL com senha


def test_workflow_agendado_usa_o_secret():
    yaml = pytest.importorskip("yaml")
    wf =yaml.safe_load((RAIZ / ".github/workflows/supabase-keepalive.yml").read_text(encoding="utf-8"))
    gatilhos = wf[True] if True in wf else wf["on"]  # o PyYAML lê a chave "on" como True
    assert gatilhos["schedule"][0]["cron"]
    passos = wf["jobs"]["ping"]["steps"]
    ping = next(p for p in passos if p.get("name") == "Ler o banco")
    assert ping["env"]["DATABASE_URL"] == "${{ secrets.SUPABASE_DATABASE_URL }}"
    assert ping["run"] == "python -m app.db.keepalive"


def _banco_com_posts(tmp_path, linhas):
    url = f"sqlite:///{(tmp_path / 's.db').as_posix()}"
    with create_engine(url).begin() as conn:
        conn.execute(text(
            "CREATE TABLE posts (id INTEGER PRIMARY KEY, status TEXT, scheduled_at DATETIME, updated_at DATETIME)"
        ))
        for linha in linhas:
            conn.execute(text(
                "INSERT INTO posts (id, status, scheduled_at, updated_at) VALUES (:id, :status, :ag, :up)"
            ), linha)
    return url


def test_saude_ok_e_problemas(tmp_path):
    agora = datetime(2026, 11, 19, 12, 0)
    h = lambda n: agora - timedelta(hours=n)  # noqa: E731
    url = _banco_com_posts(tmp_path, [
        {"id": 1, "status": "published", "ag": h(5), "up": h(5)},
        {"id": 2, "status": "failed", "ag": h(3), "up": h(2)},        # falhou hoje
        {"id": 3, "status": "failed", "ag": h(50), "up": h(48)},      # falha antiga, ignora
        {"id": 4, "status": "publishing", "ag": h(3), "up": h(2)},    # preso
        {"id": 5, "status": "scheduled", "ag": h(2), "up": h(10)},    # atrasado
        {"id": 6, "status": "scheduled", "ag": agora + timedelta(hours=3), "up": h(1)},  # futuro, ok
    ])
    problemas = keepalive.checar_saude(url, agora=agora)
    assert problemas == [
        "1 post(s) falharam nas últimas 24h: ids 2",
        "1 post(s) presos em publishing há mais de 1h: ids 4",
        "1 post(s) agendados com mais de 1h de atraso: ids 5",
    ]


def test_saude_sem_problemas(tmp_path):
    url = _banco_com_posts(tmp_path, [{"id": 1, "status": "published", "ag": None, "up": datetime(2026, 11, 19)}])
    assert keepalive.checar_saude(url, agora=datetime(2026, 11, 19, 12, 0)) == []
