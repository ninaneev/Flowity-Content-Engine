"""Data do calendário e pilar de conteúdo: o calendário e o pipeline leem a mesma coluna."""
from app.models.generation import PostSource
from app.models.source import Source


def test_patch_scheduled_at_null_limpa_a_data(client, post_criado):
    pid = post_criado["id"]
    r = client.patch(f"/posts/{pid}", json={"scheduled_at": "2026-11-02T14:00:00Z"})
    assert r.status_code == 200, r.text
    assert r.json()["scheduled_at"].startswith("2026-11-02T14:00")

    r = client.get("/posts/calendar", params={"month": "2026-11"})
    assert [p["id"] for p in r.json()] == [pid]

    r = client.patch(f"/posts/{pid}", json={"scheduled_at": None})
    assert r.status_code == 200, r.text
    assert r.json()["scheduled_at"] is None
    assert client.get(f"/posts/{pid}").json()["scheduled_at"] is None
    assert client.get("/posts/calendar", params={"month": "2026-11"}).json() == []


def test_patch_sem_scheduled_at_nao_mexe_na_data(client, post_criado):
    pid = post_criado["id"]
    client.patch(f"/posts/{pid}", json={"scheduled_at": "2026-11-02T14:00:00Z"})
    r = client.patch(f"/posts/{pid}", json={"hook": "Outro gancho"})
    assert r.json()["scheduled_at"].startswith("2026-11-02T14:00")


def test_pilar_ida_e_volta(client):
    r = client.post("/posts/", json={"hook": "Passo a passo", "status": "draft", "pillar": "workflow"})
    assert r.status_code == 201, r.text
    pid = r.json()["id"]
    assert r.json()["pillar"] == "workflow"

    r = client.patch(f"/posts/{pid}", json={"pillar": "proof", "scheduled_at": "2026-11-03T14:00:00Z"})
    assert r.json()["pillar"] == "proof"
    assert client.get(f"/posts/{pid}").json()["pillar"] == "proof"
    assert [p["pillar"] for p in client.get("/posts/").json()] == ["proof"]
    assert client.get("/posts/calendar", params={"month": "2026-11"}).json()[0]["pillar"] == "proof"

    r = client.patch(f"/posts/{pid}", json={"pillar": ""})
    assert r.json()["pillar"] is None


def test_pilar_invalido_retorna_422(client, post_criado):
    r = client.patch(f"/posts/{post_criado['id']}", json={"pillar": "meme"})
    assert r.status_code == 422


def test_listagem_traz_source_ids_de_cada_post(client, db):
    a = client.post("/posts/", json={"hook": "A"}).json()["id"]
    b = client.post("/posts/", json={"hook": "B"}).json()["id"]
    s1 = Source(title="S1", source_type="note", content="um")
    s2 = Source(title="S2", source_type="note", content="dois")
    db.add_all([s1, s2])
    db.flush()
    db.add_all([PostSource(post_id=a, source_id=s1.id), PostSource(post_id=a, source_id=s2.id)])
    db.commit()

    por_id = {p["id"]: p["source_ids"] for p in client.get("/posts/").json()}
    assert por_id == {a: [s1.id, s2.id], b: []}
