from datetime import datetime, timezone
import secrets

from fastapi import APIRouter, HTTPException, status
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.db.mongodb import get_db
from app.models.user import Token, TokenGoogle, UserCreate, UserLogin, UserResponse
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
)


# Criamos o roteador (um "mini-app" só para coisas de autenticação)
router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post(
    "/registrar",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def registrar_usuario(user: UserCreate):
    """
    Cria um novo usuário no sistema.
    """
    db = get_db()

    # 1. O Leão de Chácara: Verifica se esse e-mail já existe no banco
    usuario_existente = await db.usuarios.find_one({"email": user.email})
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está cadastrado em nosso sistema.",
        )

    # 2. A Máquina Enigma: Criptografa a senha do usuário
    senha_criptografada = get_password_hash(user.password)

    # 3. Preparando o Pacote: Monta os dados para salvar
    novo_usuario_dict = user.model_dump()
    del novo_usuario_dict["password"]  # NUNCA salvamos a senha limpa!

    novo_usuario_dict["hashed_password"] = senha_criptografada
    novo_usuario_dict["is_active"] = True
    novo_usuario_dict["data_criacao"] = datetime.now(timezone.utc)

    # 4. O Cofre: Salva no MongoDB (numa coleção chamada 'usuarios')
    resultado = await db.usuarios.insert_one(novo_usuario_dict)

    # 5. A Resposta: Devolvemos os dados para a tela (sem a senha, claro)
    novo_usuario_dict["id"] = str(resultado.inserted_id)
    return novo_usuario_dict


@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    """
    Verifica o e-mail e a senha, e devolve os Tokens de Acesso.
    """
    db = get_db()

    # 1. Procura o usuário pelo e-mail
    db_user = await db.usuarios.find_one({"email": user.email})
    if not db_user:
        # Por segurança, nunca dizemos se foi o e-mail ou a senha que errou!
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    # 2. Verifica se a senha que ele digitou bate com o hash do banco
    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    # 3. Se passou pelos testes, geramos os Tokens! (Colocamos o e-mail dentro do token)
    access_token = create_access_token(data={"sub": db_user["email"]})
    refresh_token = create_refresh_token(data={"sub": db_user["email"]})

    # 4. Entregamos a chave do carro para o frontend
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/google", response_model=Token, status_code=status.HTTP_200_OK)
async def login_google(google_data: TokenGoogle):
    """
    Recebe o Token do Google, valida, e cria o usuário se não existir.
    Devolve os Tokens JWT de acesso do nosso sistema.
    """
    db = get_db()

    try:
        # 1. O Leão de Chácara: Verifica se o token do Google é verdadeiro e foi feito para o seu App
        idinfo = id_token.verify_oauth2_token(
            google_data.token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        # 2. Pega os dados que o Google devolveu
        email = idinfo["email"]
        nome = idinfo.get("name", "Usuário Google")

        # 3. Procura no nosso banco de dados se esse cara já existe
        usuario_db = await db.usuarios.find_one({"email": email})

        # 4. Se ele não existe, nós criamos o cadastro dele NA HORA, automaticamente!
        if not usuario_db:
            # Como ele logou pelo Google, não tem senha. Geramos uma senha gigante e impossível de adivinhar.
            senha_impossivel = get_password_hash(secrets.token_hex(16))

            novo_usuario = {
                "email": email,
                "nome": nome,
                "hashed_password": senha_impossivel,
                "is_active": True,
                "data_criacao": datetime.now(timezone.utc),
            }
            resultado = await db.usuarios.insert_one(novo_usuario)
            usuario_db = await db.usuarios.find_one({"_id": resultado.inserted_id})

        # 5. O momento da verdade: Gera os NOSSOS crachás de acesso para ele passear pelo App
        access_token = create_access_token(data={"sub": usuario_db["email"]})
        refresh_token = create_refresh_token(data={"sub": usuario_db["email"]})

        return Token(access_token=access_token, refresh_token=refresh_token)

    except ValueError:
        # Se um hacker tentar mandar um token falso do Google, a gente barra aqui:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token do Google inválido ou expirado.",
        )


