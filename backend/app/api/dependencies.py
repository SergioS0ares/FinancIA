from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongodb import get_db
from ..core.config import Settings, get_settings


def get_app_settings() -> Settings:
    return get_settings()


# Compatibilidade com o projeto: mantém o provider de settings existente.
SettingsDep = Depends(get_app_settings)


# Extrai o token do header Authorization: Bearer <token>
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncIOMotorDatabase = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> dict:
    """
    Valida o Access Token e retorna o usuário logado do MongoDB.
    Se o token for inválido ou expirado, levanta erro 401.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas ou token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.usuarios.find_one({"email": email})
    if user is None:
        raise credentials_exception

    return user

