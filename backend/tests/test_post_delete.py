"""DELETE /posts/{id}: removes the post, its assets rows and local files; blocks publishing posts."""
from pathlib import Path

from app.core.config import settings
from app.models.post_asset import PostAsset

PNG_1X1 = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d49444154789c6300010000000500010d0a2db40000"
    "000049454e44ae426082"
)
ALT = "Bar chart with the monthly growth of followers"


def _upload(client, post_id):
    resposta = client.post(
        f"/posts/{post_id}/assets",
        files={"file": ("chart.png", PNG_1X1, "image/png")},
        data={"alt_text": ALT},
    )
    assert resposta.status_code == 201, resposta.text
    return resposta.json()


def test_delete_removes_post_assets_and_files(client, post_criado):
    post_id = post_criado["id"]
    asset = _upload(client, post_id)
    arquivo = Path(settings.MEDIA_DIR) / asset["file_path"]
    assert arquivo.exists()

    resposta = client.delete(f"/posts/{post_id}")

    assert resposta.status_code == 204, resposta.text
    assert client.get(f"/posts/{post_id}").status_code == 404
    assert not arquivo.exists()
    assert not (Path(settings.MEDIA_DIR) / "posts" / str(post_id)).exists()


def test_delete_leaves_no_asset_rows(client, post_criado, db):
    post_id = post_criado["id"]
    _upload(client, post_id)

    assert client.delete(f"/posts/{post_id}").status_code == 204
    assert db.query(PostAsset).filter(PostAsset.post_id == post_id).count() == 0


def test_delete_missing_post_returns_404(client):
    assert client.delete("/posts/99999").status_code == 404


def test_delete_blocked_while_publishing(client, post_criado):
    post_id = post_criado["id"]
    client.patch(f"/posts/{post_id}", json={"status": "publishing"})

    resposta = client.delete(f"/posts/{post_id}")

    assert resposta.status_code == 409
    assert "being published" in resposta.json()["detail"]
    assert client.get(f"/posts/{post_id}").status_code == 200


def test_delete_does_not_touch_other_posts(client, post_criado):
    outro = client.post("/posts/", json={"hook": "Other post", "channel": "linkedin", "status": "draft"}).json()
    assert client.delete(f"/posts/{post_criado['id']}").status_code == 204
    assert client.get(f"/posts/{outro['id']}").status_code == 200
    assert [p["id"] for p in client.get("/posts/").json()] == [outro["id"]]
