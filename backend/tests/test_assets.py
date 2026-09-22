"""Testes da API de imagens do post (Tarefas 5 e 6 do PI 2)."""
import pytest

from app.models.post_asset import PostAsset

# Menor PNG válido (1x1 pixel transparente).
PNG_1X1 = bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010806000000"
    "1f15c4890000000d49444154789c6300010000000500010d0a2db40000"
    "000049454e44ae426082"
)
ALT_VALIDO = "Gráfico de barras com o crescimento mensal de seguidores"


def _enviar(client, post_id, nome, conteudo, tipo, alt_text):
    return client.post(
        f"/posts/{post_id}/assets",
        files={"file": (nome, conteudo, tipo)},
        data={"alt_text": alt_text},
    )


def test_upload_png_aceito(client, post_criado):
    resposta = _enviar(client, post_criado["id"], "grafico.png", PNG_1X1, "image/png", ALT_VALIDO)
    assert resposta.status_code == 201, resposta.text
    corpo = resposta.json()
    assert corpo["mime_type"] == "image/png"
    assert corpo["alt_text"] == ALT_VALIDO


def test_upload_tipo_invalido(client, post_criado):
    # O roteiro da T15 fala em 400, mas o contrato da T5 (DoD da issue #80)
    # define 415 Unsupported Media Type para formato fora de PNG/JPEG/WebP.
    resposta = _enviar(client, post_criado["id"], "notas.txt", b"texto", "text/plain", ALT_VALIDO)
    assert resposta.status_code == 415, resposta.text


def test_alt_text_vazio_retorna_422(client, post_criado):
    resposta = _enviar(client, post_criado["id"], "grafico.png", PNG_1X1, "image/png", "")
    assert resposta.status_code == 422, resposta.text


def test_agendar_post_com_imagem_sem_alt_retorna_422(client, db, post_criado):
    # A trava de agendamento vem da Tarefa 6 (issue #83). Enquanto ela não
    # estiver na main, o teste é pulado em vez de falhar.
    pytest.importorskip(
        "app.services.accessibility",
        reason="depende da Tarefa 6 (#83): trava de alt text ao agendar",
    )
    # Uma imagem "legada" sem alt text, gravada direto no banco.
    db.add(
        PostAsset(
            post_id=post_criado["id"],
            file_path="posts/legado.png",
            mime_type="image/png",
            alt_text="",
        )
    )
    db.commit()

    resposta = client.put(
        f"/posts/{post_criado['id']}",
        json={"status": "scheduled", "scheduled_at": "2030-01-10T10:00:00"},
    )
    assert resposta.status_code == 422, resposta.text
