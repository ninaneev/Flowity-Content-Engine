"""
Configurações do sistema.
Lê tudo do arquivo .env via pydantic-settings.
"""

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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Instância global — importe assim: from app.core.config import settings
settings = Settings()
