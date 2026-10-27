"""Testes do alerta de engajamento baixo (Tarefa 14 do PI 2)."""
from datetime import datetime

from app.models.post import Post


def _post_com_metrica(client, db, hook, impressoes, curtidas, publicado_em, plataforma="linkedin"):
    post = Post(hook=hook, channel=plataforma, status="published", published_at=publicado_em)
    db.add(post)
    db.commit()
    db.refresh(post)
    resposta = client.post(
        f"/posts/{post.id}/metrics",
        json={
            "platform": plataforma,
            "impressions": impressoes,
            "likes": curtidas,
            "collected_at": "2026-09-20T12:00:00",
        },
    )
    assert resposta.status_code == 201, resposta.text
    return post.id


def test_limite_padrao_e_2_por_cento(client):
    resposta = client.get("/settings/alerts")
    assert resposta.status_code == 200
    assert resposta.json()["min_engagement_rate"] == 0.02


def test_put_grava_novo_limite(client):
    resposta = client.put("/settings/alerts", json={"min_engagement_rate": 0.035})
    assert resposta.status_code == 200
    assert client.get("/settings/alerts").json()["min_engagement_rate"] == 0.035


def test_put_recusa_limite_fora_de_0_a_1(client):
    assert client.put("/settings/alerts", json={"min_engagement_rate": 2}).status_code == 422
    assert client.put("/settings/alerts", json={"min_engagement_rate": -0.1}).status_code == 422


def test_alertas_lista_so_posts_abaixo_do_limite(client, db):
    baixo = _post_com_metrica(client, db, "Post fraco", 1000, 11, datetime(2026, 9, 10))  # 1,1%
    _post_com_metrica(client, db, "Post bom", 1000, 45, datetime(2026, 9, 11))            # 4,5%
    _post_com_metrica(client, db, "Sem impressoes", 0, 0, datetime(2026, 9, 12))          # sem taxa

    alertas = client.get("/alerts").json()
    assert [a["post_id"] for a in alertas] == [baixo]
    assert alertas[0]["engagement_rate"] == 0.011
    assert alertas[0]["hook"] == "Post fraco"
    assert alertas[0]["channel"] == "linkedin"


def test_alertas_seguem_o_limite_configurado(client, db):
    _post_com_metrica(client, db, "Post medio", 1000, 30, datetime(2026, 9, 10))  # 3%
    assert client.get("/alerts").json() == []

    client.put("/settings/alerts", json={"min_engagement_rate": 0.05})
    assert len(client.get("/alerts").json()) == 1
