from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # IA / Banco
    gemini_api_key: str = Field(..., env="GEMINI_API_KEY")
    mongodb_uri: str = Field(..., env="MONGODB_URI")
    mongodb_uri_direct: str = Field("", env="MONGODB_URI_DIRECT")
    mongodb_password: str | None = Field(None, env="MONGODB_PASSWORD")
    database_name: str | None = Field(None, env="DATABASE_NAME")

    # Segurança (Tokens / JWT)
    SECRET_KEY: str = Field("chave_fallback_se_der_erro", env="SECRET_KEY")
    REFRESH_SECRET_KEY: str = Field(
        "chave_refresh_fallback", env="REFRESH_SECRET_KEY"
    )
    ALGORITHM: str = Field("HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        15, env="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(7, env="REFRESH_TOKEN_EXPIRE_DAYS")

    # Chave do Google para Login
    GOOGLE_CLIENT_ID: str = Field("seu_id_aqui", env="GOOGLE_CLIENT_ID")

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()

