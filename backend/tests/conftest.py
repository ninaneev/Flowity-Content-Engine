"""
Configuração compartilhada dos testes do backend (Tarefa 15 do PI 2).

- Banco SQLite em memória (StaticPool), recriado a cada teste.
- Pasta de mídia temporária, para os uploads não sujarem o projeto.
- Autenticação trocada por um admin fixo.
"""
import os
import tempfile

# As variáveis precisam existir ANTES de importar o app.
_MEDIA_TMP = tempfile.mkdtemp(prefix="flowity-test-media-")
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["MEDIA_DIR"] = _MEDIA_TMP

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.core.security import get_current_admin  # noqa: E402
from app.db.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import generation, post, post_asset, post_metric, source  # noqa: E402,F401

settings.MEDIA_DIR = _MEDIA_TMP

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _get_test_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _get_test_db
app.dependency_overrides[get_current_admin] = lambda: "admin"


@pytest.fixture(autouse=True)
def _banco_limpo():
    """Cada teste começa com as tabelas vazias."""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def db():
    """Sessão direta no banco de teste, para montar cenários."""
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    # Sem "with": não dispara o startup do app (que criaria o banco real).
    return TestClient(app)


@pytest.fixture
def post_criado(client):
    """Cria um post em rascunho e devolve o JSON da resposta."""
    resposta = client.post(
        "/posts/",
        json={"hook": "Post de teste", "channel": "linkedin", "status": "draft"},
    )
    assert resposta.status_code == 201, resposta.text
    return resposta.json()
