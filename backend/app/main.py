"""
Flowity Content Engine — API Backend
FastAPI + SQLAlchemy + Supabase/SQLite
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.database import create_tables
from app.routes import assets, auth, automation, generation, metrics, posts, sources

Path(settings.MEDIA_DIR).mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description="Flowity Content Engine API for content generation, scheduling, and publishing.",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI: http://localhost:8000/docs
    redoc_url="/redoc",  # ReDoc:       http://localhost:8000/redoc
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": {
                "code": "VALIDATION_ERROR",
                "message": "Dados inválidos",
                "errors": jsonable_encoder(exc.errors()),
            }
        },
    )


# ── CORS ──────────────────────────────────────────────────────────────────────
# Origens vêm de CORS_ORIGINS (variável de ambiente). No desenvolvimento o
# padrão libera o Vite local; em produção, só a URL do frontend publicado.
_PRIVATE_NETWORK_ORIGIN_REGEX = (
    r"^http://("
    r"localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|"
    r"192\.168\.\d{1,3}\.\d{1,3}|"
    r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
    r"172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}"
    r"):\d+$"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=(
        _PRIVATE_NETWORK_ORIGIN_REGEX if settings.CORS_ALLOW_PRIVATE_NETWORK else None
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rotas ─────────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(sources.router, prefix="/sources", tags=["Sources"])
app.include_router(posts.router, prefix="/posts", tags=["Posts"])
app.include_router(generation.router, prefix="/generation", tags=["AI Generation"])
app.include_router(automation.router, prefix="/automation", tags=["n8n Automation"])
app.include_router(assets.router, tags=["Media Assets"])
# Inclusão do router das Métricas (PI 2)
app.include_router(metrics.router, prefix="", tags=["Metrics"])

app.mount(
    settings.MEDIA_URL_PREFIX,
    StaticFiles(directory=settings.MEDIA_DIR),
    name="media",
)


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    """Create database tables on startup when they do not exist yet."""
    create_tables()
    print(f"{settings.APP_NAME} started. Docs at http://localhost:8000/docs")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    """Check whether the API is online."""
    return {"status": "ok", "service": settings.APP_NAME}
