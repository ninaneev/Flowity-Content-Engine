"""Status "archived" (fora do pipeline, nunca publicado) e o "Approve" da Library."""
from datetime import timedelta

from sqlalchemy import text

from tests.test_autopost_rpc import _agora, _claim, _post, pg, pg_db, precisa_pg  # noqa: F401
from tests.test_company_autopost import _claim_company, _sql


def test_archive_e_volta_para_draft(client):
    pid = client.post("/posts/", json={"hook": "Velho", "status": "to_approve"}).json()["id"]
    r = client.patch(f"/posts/{pid}", json={"status": "archived"})
    assert r.status_code == 200 and r.json()["status"] == "archived"
    assert [p["id"] for p in client.get("/posts/", params={"status": "archived"}).json()] == [pid]

    r = client.patch(f"/posts/{pid}", json={"status": "draft"})
    assert r.json()["status"] == "draft"


def test_status_invalido_no_update_e_recusado(client):
    pid = client.post("/posts/", json={"hook": "X", "status": "draft"}).json()["id"]
    assert client.patch(f"/posts/{pid}", json={"status": "lixo"}).status_code == 422


def test_arquivado_com_data_fica_fora_do_calendario(client):
    agora = _agora()
    quando = (agora + timedelta(days=3)).isoformat()
    pid = client.post("/posts/", json={"hook": "Agendado", "status": "scheduled", "scheduled_at": quando}).json()["id"]
    client.patch(f"/posts/{pid}", json={"status": "archived"})
    mes = quando[:7]
    assert pid not in [p["id"] for p in client.get("/posts/calendar", params={"month": mes}).json()]


def test_approve_da_library_cria_post_to_approve_e_marca_usado(client):
    sid = client.post("/sources/", json={"title": "Ideia boa", "source_type": "ideia", "content": "O angulo"}).json()["id"]
    assert client.get("/sources/").json()[0]["used"] is False

    r = client.post(f"/sources/{sid}/approve")
    assert r.status_code == 201
    post = r.json()
    assert (post["status"], post["hook"], post["body"], post["source_ids"]) == ("to_approve", "Ideia boa", "O angulo", [sid])
    assert post["scheduled_at"] is None
    assert client.get("/sources/").json()[0]["used"] is True
    assert client.get(f"/sources/{sid}").json()["used"] is True


def test_approve_de_source_inexistente_da_404(client):
    assert client.post("/sources/999/approve").status_code == 404


@precisa_pg
def test_arquivado_nunca_sai_no_autopost(pg):
    agora = _agora()
    for canal in ("linkedin", "linkedin_company", "article"):
        _post(pg, agora - timedelta(minutes=5), channel=canal, status="archived", body="slug: teste\nCorpo")
    assert _claim(pg) == []
    assert _claim_company(pg) == []
    assert _sql(pg, "select * from claim_next_due_web_post()") == []
    with pg.connect() as conn:
        assert conn.execute(text("select count(*) from posts_due_now")).scalar() == 0
        assert conn.execute(text("select count(*) from posts where status = 'archived'")).scalar() == 3
