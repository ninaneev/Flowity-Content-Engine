"""Cópia pública das imagens no Supabase Storage (app/services/storage.py), sem rede de verdade."""
import httpx
import pytest

from app.core.config import settings
from app.models.post_asset import PostAsset
from app.services import storage

# GIF 1x1 válido: tem que chegar ao Storage byte a byte, sem reencode
GIF_1X1 = bytes.fromhex("47494638396101000100800000000000ffffff21f90401000000002c00000000010001000002024401003b")
ALT = "Animação curta mostrando o painel de sinais do cliente"
URL = "https://projeto-teste.supabase.co"


@pytest.fixture(autouse=True)
def _estado_limpo(monkeypatch):
    monkeypatch.setattr(storage, "_buckets_ok", set())
    monkeypatch.setattr(storage, "_avisou_sem_config", False)
    monkeypatch.setattr(settings, "SUPABASE_URL", "")
    monkeypatch.setattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "")


@pytest.fixture
def supabase_falso(monkeypatch):
    """Liga a configuração e troca o cliente HTTP por um MockTransport que guarda as chamadas."""
    monkeypatch.setattr(settings, "SUPABASE_URL", URL + "/")
    monkeypatch.setattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "chave-de-teste")
    chamadas = []
    buckets = set()

    def responder(req: httpx.Request) -> httpx.Response:
        chamadas.append(req)
        caminho = req.url.path
        if req.method == "GET" and caminho.startswith("/storage/v1/bucket/"):
            nome = caminho.rsplit("/", 1)[-1]
            return httpx.Response(200 if nome in buckets else 400, json={"message": "Bucket not found"})
        if req.method == "POST" and caminho == "/storage/v1/bucket":
            buckets.add("post-images")
            return httpx.Response(200, json={"name": "post-images"})
        if req.method == "POST" and caminho.startswith("/storage/v1/object/"):
            return httpx.Response(200, json={"Key": caminho})
        return httpx.Response(404)

    monkeypatch.setattr(storage, "client_factory", lambda: httpx.Client(transport=httpx.MockTransport(responder)))
    return chamadas


def _enviar(client, post_id, nome, conteudo, tipo):
    return client.post(
        f"/posts/{post_id}/assets",
        files={"file": (nome, conteudo, tipo)},
        data={"alt_text": ALT},
    )


def test_sem_configuracao_pula_sem_chamar_rede(client, post_criado, monkeypatch):
    def proibido():
        raise AssertionError("não deveria abrir conexão sem SUPABASE_URL")

    monkeypatch.setattr(storage, "client_factory", proibido)
    r = _enviar(client, post_criado["id"], "anim.gif", GIF_1X1, "image/gif")
    assert r.status_code == 201, r.text
    assert r.json()["public_url"] is None
    assert r.json()["mime_type"] == "image/gif"


def test_upload_gif_vai_para_o_bucket_publico(client, post_criado, supabase_falso):
    r = _enviar(client, post_criado["id"], "anim.gif", GIF_1X1, "image/gif")
    assert r.status_code == 201, r.text
    corpo = r.json()
    nome = corpo["file_path"].rsplit("/", 1)[-1]
    esperado = f"posts/{post_criado['id']}/{corpo['id']}-{nome}"
    assert corpo["public_url"] == f"{URL}/storage/v1/object/public/post-images/{esperado}"

    metodos = [(c.method, c.url.path) for c in supabase_falso]
    assert metodos == [
        ("GET", "/storage/v1/bucket/post-images"),
        ("POST", "/storage/v1/bucket"),
        ("POST", f"/storage/v1/object/post-images/{esperado}"),
    ]
    criar_bucket, upload = supabase_falso[1], supabase_falso[2]
    assert b'"public":true' in criar_bucket.content.replace(b" ", b"")
    assert upload.headers["content-type"] == "image/gif"
    assert upload.headers["x-upsert"] == "true"
    assert upload.headers["authorization"] == "Bearer chave-de-teste"
    assert upload.content == GIF_1X1


def test_falha_no_storage_nao_derruba_o_upload(client, post_criado, monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_URL", URL)
    monkeypatch.setattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "chave")
    monkeypatch.setattr(
        storage, "client_factory",
        lambda: httpx.Client(transport=httpx.MockTransport(lambda req: httpx.Response(500))),
    )
    r = _enviar(client, post_criado["id"], "anim.gif", GIF_1X1, "image/gif")
    assert r.status_code == 201, r.text
    assert r.json()["public_url"] is None


def test_backfill_envia_so_o_que_falta(db, post_criado, supabase_falso, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "MEDIA_DIR", str(tmp_path))
    (tmp_path / "posts").mkdir()
    (tmp_path / "posts" / "velho.gif").write_bytes(GIF_1X1)
    velho = PostAsset(post_id=post_criado["id"], file_path="posts/velho.gif", mime_type="image/gif", alt_text=ALT)
    pronto = PostAsset(post_id=post_criado["id"], file_path="posts/ja.png", mime_type="image/png",
                       alt_text=ALT, public_url="https://ja/existe.png")
    db.add_all([velho, pronto])
    db.commit()

    assert storage.backfill(db) == {"pendentes": 1, "enviados": 1, "falharam": 0}
    db.refresh(velho)
    assert velho.public_url.endswith(f"/post-images/posts/{post_criado['id']}/{velho.id}-velho.gif")
    assert supabase_falso[-1].content == GIF_1X1


def test_cli_sem_configuracao_avisa_e_sai(capsys):
    assert storage.main(["backfill"]) == 1
    assert "SUPABASE_URL" in capsys.readouterr().err
    assert storage.main([]) == 2


@pytest.fixture
def bucket_falso(monkeypatch):
    """Bucket com uma pasta, um GIF solto e um arquivo que não é imagem."""
    monkeypatch.setattr(settings, "SUPABASE_URL", URL)
    monkeypatch.setattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "chave-de-teste")
    niveis = {
        "": [
            {"name": "posts", "id": None},
            {"name": "signal-workflow.gif", "id": "a", "updated_at": "2026-10-28T02:00:00Z",
             "metadata": {"mimetype": "image/gif", "size": len(GIF_1X1)}},
            {"name": "notas.txt", "id": "b", "metadata": {"mimetype": "text/plain", "size": 3}},
        ],
        "posts": [{"name": "7", "id": None}],
        "posts/7": [{"name": "foto.gif", "id": "c", "updated_at": "2026-10-27T10:00:00Z",
                     "metadata": {"mimetype": "image/gif", "size": len(GIF_1X1)}}],
    }

    def responder(req: httpx.Request) -> httpx.Response:
        if req.method == "POST" and req.url.path == "/storage/v1/object/list/post-images":
            import json
            return httpx.Response(200, json=niveis.get(json.loads(req.content)["prefix"], []))
        if req.method == "GET" and req.url.path == "/storage/v1/object/post-images/signal-workflow.gif":
            return httpx.Response(200, content=GIF_1X1, headers={"content-type": "image/gif"})
        return httpx.Response(404, json={"message": "not found"})

    monkeypatch.setattr(storage, "client_factory", lambda: httpx.Client(transport=httpx.MockTransport(responder)))


def test_lista_imagens_do_bucket_com_pastas(client, bucket_falso):
    r = client.get("/storage/images")
    assert r.status_code == 200, r.text
    assert [i["path"] for i in r.json()] == ["signal-workflow.gif", "posts/7/foto.gif"]
    assert r.json()[0]["url"] == f"{URL}/storage/v1/object/public/post-images/signal-workflow.gif"


def test_lista_sem_configuracao_avisa(client):
    r = client.get("/storage/images")
    assert r.status_code == 503
    assert r.json()["detail"]["code"] == "STORAGE_NOT_CONFIGURED"


def test_anexa_imagem_do_bucket_sem_novo_upload(client, post_criado, bucket_falso):
    r = client.post(f"/posts/{post_criado['id']}/assets/from-storage",
                    json={"path": "signal-workflow.gif", "alt_text": ALT})
    assert r.status_code == 201, r.text
    corpo = r.json()
    assert corpo["public_url"] == f"{URL}/storage/v1/object/public/post-images/signal-workflow.gif"
    assert corpo["mime_type"] == "image/gif"
    assert corpo["size_bytes"] == len(GIF_1X1)


def test_anexa_imagem_inexistente_do_bucket(client, post_criado, bucket_falso):
    r = client.post(f"/posts/{post_criado['id']}/assets/from-storage",
                    json={"path": "nao-existe.png", "alt_text": ALT})
    assert r.status_code == 404
