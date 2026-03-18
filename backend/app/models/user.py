from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ==========================================
# 👤 MODELOS DE USUÁRIO (O nosso "Zod")
# ==========================================


class UserBase(BaseModel):
    """A base de todo usuário: o que todos eles têm em comum."""

    email: EmailStr
    nome: str = Field(..., min_length=2, description="Nome do usuário")


class UserCreate(UserBase):
    """O que o Angular envia quando o usuário preenche a tela de Cadastro."""

    # Exigimos no mínimo 6 caracteres para a senha
    password: str = Field(..., min_length=6, description="Senha do usuário")


class UserLogin(BaseModel):
    """O que o Angular envia quando o usuário tenta logar."""

    email: EmailStr
    password: str


class UserInDB(UserBase):
    """O formato exato de como o usuário será salvo no cofre do MongoDB."""

    id: str
    hashed_password: str
    is_active: bool = True
    data_criacao: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class UserResponse(UserBase):
    """O que devolvemos para o Angular (NUNCA devolvemos a senha!)."""

    id: str
    is_active: bool
    data_criacao: datetime


# ==========================================
# 🎟️ MODELOS DE SEGURANÇA (Tokens)
# ==========================================


class Token(BaseModel):
    """O formato da resposta quando o usuário faz o Login com sucesso."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Os dados que ficam escondidos dentro do código do JWT."""

    email: Optional[str] = None


class TokenGoogle(BaseModel):
    """O que o Angular envia quando o usuário clica no botão do Google."""

    token: str


class EsqueciSenhaRequest(BaseModel):
    """Payload da tela 'Esqueci minha senha'."""

    email: EmailStr

