"""
Conexão com o banco de dados via SQLAlchemy.
Funciona com Supabase (PostgreSQL) ou SQLite local.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

# ── Engine ────────────────────────────────────────────────────────────────────
# Para SQLite local (desenvolvimento sem internet):
#   DATABASE_URL=sqlite:///./flowity.db
# Para Supabase (produção):
#   DATABASE_URL=postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}  # Necessário só para SQLite

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

# ── Sessão ────────────────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Base ORM ──────────────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependência FastAPI ───────────────────────────────────────────────────────
def get_db():
    """
    Use em qualquer rota que precisa do banco:
        @router.get("/")
        def listar(db: Session = Depends(get_db)):
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Cria todas as tabelas no banco. Chamado no startup da API."""
    from app.models import source, post, generation  # noqa: F401 — garante que os modelos são registrados
    Base.metadata.create_all(bind=engine)
