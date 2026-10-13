"""Testes do resumo de métricas usado pelo painel de análise (Tarefa 13 do PI 2)."""
from datetime import datetime

from app.models.post import Post


def _post_publicado(db, hook, canal, publicado_em):
    post = Post(hook=hook, channel=canal, status="published", published_at=publicado_em)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post.id


def _metrica(client, post_id, plataforma, impressoes, curtidas, comentarios=0, compartilhamentos=0):
    resposta = client.post(
        f"/posts/{post_id}/metrics",
        json={
            "platform": plataforma,
            "impressions": impressoes,
            "likes": curtidas,
            "comments": comentarios,
            "shares": compartilhamentos,
            "collected_at": "2026-09-20T12:00:00",
        },
    )
    assert resposta.status_code == 201, resposta.text


def test_resumo_vazio_traz_listas_vazias(client):
    corpo = client.get("/metrics/summary").json()
    assert corpo["total_publicados"] == 0
    assert corpo["por_dia_semana"] == []
    assert corpo["total_impressoes"] == 0


def test_resumo_agrupa_por_dia_da_semana(client, db):
    # 2026-09-14 é segunda-feira (dow = 1); 2026-09-20 é domingo (dow = 0).
    segunda_a = _post_publicado(db, "A", "linkedin", datetime(2026, 9, 14, 9))
    segunda_b = _post_publicado(db, "B", "linkedin", datetime(2026, 9, 14, 18))
    domingo = _post_publicado(db, "C", "x", datetime(2026, 9, 20, 10))

    _metrica(client, segunda_a, "linkedin", 1000, 30, 10)  # 4%
    _metrica(client, segunda_b, "linkedin", 1000, 20)      # 2%
    _metrica(client, domingo, "x", 500, 5)                 # 1%

    corpo = client.get("/metrics/summary").json()
    dias = {d["dia"]: d for d in corpo["por_dia_semana"]}

    assert set(dias) == {0, 1}
    assert dias[1]["media"] == 0.03
    assert dias[1]["publicacoes"] == 2
    assert dias[0]["media"] == 0.01
    assert corpo["total_impressoes"] == 2500
    assert corpo["total_interacoes"] == 65


def test_resumo_traz_interacoes_por_plataforma(client, db):
    post_id = _post_publicado(db, "D", "x", datetime(2026, 9, 15, 9))
    _metrica(client, post_id, "x", 800, 10, 2, 4)

    plataformas = {p["platform"]: p for p in client.get("/metrics/summary").json()["por_plataforma"]}
    assert plataformas["x"]["interacoes"] == 16
    assert plataformas["x"]["impressions"] == 800
