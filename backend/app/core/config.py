"""
Configurações do sistema.
Lê tudo do arquivo .env via pydantic-settings.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Banco de dados ────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./flowity.db"

    # ── Mídia (PI 2) ──────────────────────────────────────────────
    MEDIA_DIR: str = "./media"
    MEDIA_URL_PREFIX: str = "/media"
    MAX_UPLOAD_BYTES: int = 5 * 1024 * 1024
    ALLOWED_IMAGE_MIME: str = "image/png,image/jpeg,image/webp"

    # ── Autenticação ──────────────────────────────────────────────
    JWT_SECRET: str = "troque-isso-por-uma-string-aleatoria-de-64-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD_HASH: str = ""  # Gere com bcrypt antes de rodar

    # ── Ollama ────────────────────────────────────────────────────
    OLLAMA_BASE_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"

    # ── n8n ───────────────────────────────────────────────────────
    N8N_WEBHOOK_SECRET: str = "troque-isso-por-uma-string-secreta"

    # ── App ───────────────────────────────────────────────────────
    APP_NAME: str = "Flowity Content Engine"
    DEBUG: bool = False

    # ── CORS / implantação em nuvem (PI 2 — T4) ───────────────────
    # Lista de origens separadas por vírgula. Em produção, só a URL do
    # frontend publicado, ex.: https://flowity-content-engine.vercel.app
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://localhost:5174,"
        "http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:3000"
    )
    # Libera IPs de rede local (192.168.x, 10.x...) no desenvolvimento.
    # Em produção deve ser false.
    CORS_ALLOW_PRIVATE_NETWORK: bool = True

    @field_validator("DATABASE_URL")
    @classmethod
    def _normalizar_database_url(cls, valor: str) -> str:
        """Aceita o formato "postgres://" (Render, Heroku): o SQLAlchemy 2
        só reconhece "postgresql://", então o esquema é corrigido aqui."""
        valor = valor.strip()
        if valor.startswith("postgres://"):
            return "postgresql://" + valor[len("postgres://"):]
        return valor

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Instância global — importe assim: from app.core.config import settings
settings = Settings()
