"""
Flowity Content Engine — API Backend
FastAPI + SQLAlchemy + Supabase/SQLite
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import create_tables
from app.routes import auth, sources, posts, generation, automation

app = FastAPI(
    title=settings.APP_NAME,
    description="API do Flowity Content Engine — geração, agendamento e publicação de conteúdo.",
    version="1.0.0",
    docs_url="/docs",      # Swagger UI: http://localhost:8000/docs
    redoc_url="/redoc",    # ReDoc:       http://localhost:8000/redoc
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Permite que o frontend Vite se comunique com o backend (porta 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:5174",   # Vite fallback when 5173 is busy
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",   # Fallback
    ],
    allow_origin_regex=(
        r"^http://("
        r"localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|"
        r"192\.168\.\d{1,3}\.\d{1,3}|"
        r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
        r"172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}"
        r"):\d+$"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rotas ─────────────────────────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/auth",       tags=["Autenticação"])
app.include_router(sources.router,    prefix="/sources",    tags=["Sources"])
app.include_router(posts.router,      prefix="/posts",      tags=["Posts"])
app.include_router(generation.router, prefix="/generation", tags=["Geração IA"])
app.include_router(automation.router, prefix="/automation", tags=["Automação n8n"])


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    """Cria tabelas no banco ao iniciar (se ainda não existirem)."""
    create_tables()
    print(f"✅ {settings.APP_NAME} iniciado. Docs em http://localhost:8000/docs")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Sistema"])
def health_check():
    """Endpoint para verificar se a API está online."""
    return {"status": "ok", "service": settings.APP_NAME}
