"""
Segurança: criação/verificação de JWT e proteção de rotas com admin.
"""
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import bcrypt
from jose import JWTError, jwt
from app.core.config import settings

# ── Senha ─────────────────────────────────────────────────────────────────────
bearer_scheme = HTTPBearer()


def verify_password(plain: str, hashed: str) -> bool:
    """Compara senha em texto puro com hash bcrypt."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def hash_password(plain: str) -> str:
    """Gera hash bcrypt de uma senha. Use no terminal para criar ADMIN_PASSWORD_HASH."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(username: str) -> str:
    """Cria um JWT com expiração configurável via JWT_EXPIRY_HOURS."""
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decodifica e valida um JWT. Lança HTTPException se inválido."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Dependência FastAPI ───────────────────────────────────────────────────────
def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """
    Use como dependência em qualquer rota que precisa de autenticação:
        @router.post("/", dependencies=[Depends(get_current_admin)])
    ou
        @router.post("/")
        def minha_rota(_admin=Depends(get_current_admin)):
    """
    payload = decode_token(credentials.credentials)
    return payload["sub"]
