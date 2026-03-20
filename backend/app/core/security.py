from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# 1. Configuração do Bcrypt para criptografar senhas pesadamente
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara a senha que o usuário digitou com a senha bagunçada do Banco."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Transforma a senha real em um hash indecifrável antes de salvar."""
    return pwd_context.hash(password)


def create_access_token(data: dict) -> str:
    """Cria o Crachá de Acesso rápido (Dura alguns minutos)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, days: int | None = None) -> str:
    """
    Cria a Chave Mestra para renovar o acesso sem pedir login de novo.
    Se `days` for informado, usa essa validade em dias; senão usa REFRESH_TOKEN_EXPIRE_DAYS.
    """
    to_encode = data.copy()
    valid_days = days if days is not None else settings.REFRESH_TOKEN_EXPIRE_DAYS
    expire = datetime.now(timezone.utc) + timedelta(days=valid_days)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_refresh_token(token: str) -> dict | None:
    """
    Valida o refresh token (cookie HTTP-Only) e devolve o payload (ex.: {"sub": email}).
    Retorna None se inválido ou expirado.
    """
    try:
        payload = jwt.decode(
            token,
            settings.REFRESH_SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except Exception:
        return None

