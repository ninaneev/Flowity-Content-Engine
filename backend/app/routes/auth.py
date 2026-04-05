"""Rota de autenticação — login do admin."""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.core.config import settings
from app.core.security import verify_password, create_access_token

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    """
    Recebe username e password, devolve JWT.

    Para gerar o hash da senha, rode no terminal:
        python -c "from passlib.context import CryptContext; c=CryptContext(schemes=['bcrypt']); print(c.hash('sua-senha'))"
    Cole o resultado em ADMIN_PASSWORD_HASH no .env
    """
    if body.username != settings.ADMIN_USERNAME:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas.")

    if not settings.ADMIN_PASSWORD_HASH:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_PASSWORD_HASH não configurado. Veja o README.",
        )

    if not verify_password(body.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas.")

    token = create_access_token(body.username)
    return TokenResponse(access_token=token)
