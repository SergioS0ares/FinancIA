from datetime import datetime, timezone, timedelta
import secrets

from fastapi import (
    APIRouter,
    HTTPException,
    status,
    Request,
    Response,
    Form,
    BackgroundTasks,
)
from fastapi.responses import RedirectResponse
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.db.mongodb import get_db
from app.models.user import (
    Token,
    TokenGoogle,
    UserCreate,
    UserLogin,
    UserResponse,
    EsqueciSenhaRequest,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_refresh_token,
)
from app.services.email_service import send_reset_password_email
from jose import jwt

# Nome do cookie HTTP-Only onde o refresh token fica (invisível para o JavaScript)
REFRESH_TOKEN_COOKIE = "refresh_token"
REFRESH_MAX_AGE = 7 * 24 * 60 * 60  # 7 dias em segundos


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
async def login(user: UserLogin, response: Response):
    """
    Verifica o e-mail e a senha, devolve o access_token no JSON e grava o
    refresh_token num cookie HTTP-Only (o Angular não consegue ler; o navegador
    envia-o automaticamente com withCredentials na rota /refresh).
    """
    db = get_db()

    # 1. Procura o usuário pelo e-mail
    db_user = await db.usuarios.find_one({"email": user.email})
    if not db_user:
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

    # 3. Gera os tokens
    access_token = create_access_token(data={"sub": db_user["email"]})
    refresh_token = create_refresh_token(data={"sub": db_user["email"]})

    # 4. Cookie HTTP-Only: o refresh fica no “cofre” do navegador (invisível para JS)
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=refresh_token,
        httponly=True,
        secure=False,  # True em produção (HTTPS)
        samesite="lax",
        max_age=REFRESH_MAX_AGE,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/google", response_model=Token, status_code=status.HTTP_200_OK)
async def login_google(google_data: TokenGoogle, response: Response):
    """
    Recebe o Token do Google, valida, cria o usuário se não existir, devolve
    access_token no JSON e grava o refresh_token em cookie HTTP-Only.
    """
    db = get_db()

    try:
        idinfo = id_token.verify_oauth2_token(
            google_data.token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
        email = idinfo["email"]
        nome = idinfo.get("name", "Usuário Google")

        usuario_db = await db.usuarios.find_one({"email": email})
        if not usuario_db:
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

        access_token = create_access_token(data={"sub": usuario_db["email"]})
        refresh_token = create_refresh_token(data={"sub": usuario_db["email"]})

        response.set_cookie(
            key=REFRESH_TOKEN_COOKIE,
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=REFRESH_MAX_AGE,
        )

        return Token(access_token=access_token, refresh_token=refresh_token)

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token do Google inválido ou expirado.",
        )


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    """
    Lê o refresh_token do cookie HTTP-Only (enviado automaticamente pelo
    navegador com withCredentials: true) e devolve um novo access_token.
    Opcionalmente renova o refresh_token e atualiza o cookie.
    """
    refresh_token_value = request.cookies.get(REFRESH_TOKEN_COOKIE)
    if not refresh_token_value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token ausente.",
        )

    payload = verify_refresh_token(refresh_token_value)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido ou expirado.",
        )

    email = payload["sub"]
    new_access_token = create_access_token(data={"sub": email})
    new_refresh_token = create_refresh_token(data={"sub": email})

    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=REFRESH_MAX_AGE,
    )

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/google/callback")
async def google_login_callback(
    credential: str = Form(...),
    g_csrf_token: str | None = Form(None),
):
    """
    Callback do Google Identity Services em modo redirect.
    Recebe o JWT do Google via form-url-encoded, valida e redireciona
    o usuário de volta para o frontend com access/refresh tokens na URL.
    """
    db = get_db()

    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        email = idinfo.get("email")
        nome = idinfo.get("name", "Usuário")

        if not email:
            return RedirectResponse(
                url="http://localhost:4200/login?error=no_email", status_code=303
            )

        usuario_db = await db.usuarios.find_one({"email": email})

        if not usuario_db:
            novo_usuario = {
                "email": email,
                "nome": nome,
                "hashed_password": "",
                "is_active": True,
                "data_criacao": datetime.now(timezone.utc),
            }
            await db.usuarios.insert_one(novo_usuario)

        access_token = create_access_token(data={"sub": email})
        refresh_token = create_refresh_token(data={"sub": email})

        frontend_redirect_url = (
            "http://localhost:4200/login/callback"
            f"?access_token={access_token}&refresh_token={refresh_token}"
        )

        return RedirectResponse(url=frontend_redirect_url, status_code=303)

    except ValueError:
        return RedirectResponse(
            url="http://localhost:4200/login?error=invalid_token", status_code=303
        )


def criar_token_redefinicao(email: str) -> str:
    """Cria um token JWT de vida curta (ex: 15 minutos) específico para resetar a senha."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"sub": email, "type": "reset_password", "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


@router.post("/esqueci-senha")
async def esqueci_senha(
    request: EsqueciSenhaRequest,
    background_tasks: BackgroundTasks,
):
    """
    Recebe o e-mail, gera um token de redefinição e envia o link por e-mail.
    Sempre devolve sucesso, mesmo se o e-mail não existir.
    """
    db = get_db()
    usuario = await db.usuarios.find_one({"email": request.email})

    if usuario:
        reset_token = criar_token_redefinicao(request.email)
        link_angular = f"http://localhost:4200/redefinir-senha/{reset_token}"
        context = {"reset_link": link_angular}
        background_tasks.add_task(
            send_reset_password_email,
            email=request.email,
            context=context,
        )

    return {
        "message": "Se o e-mail estiver cadastrado, você receberá um link de redefinição em instantes."
    }


@router.post("/mudar-senha/{token}")
async def mudar_senha(token: str, payload: dict):
    """
    Recebe o token de redefinição e a nova senha, valida e atualiza o usuário.
    Espera um JSON: { "novaSenha": "..." }.
    """
    nova_senha = payload.get("novaSenha")
    if not nova_senha:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nova senha não fornecida.",
        )

    try:
        dados = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de redefinição inválido ou expirado.",
        )

    if dados.get("type") != "reset_password" or "sub" not in dados:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de redefinição inválido.",
        )

    email = dados["sub"]
    db = get_db()
    usuario = await db.usuarios.find_one({"email": email})
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )

    hashed = get_password_hash(nova_senha)
    await db.usuarios.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed}},
    )

    return {"message": "Senha atualizada com sucesso."}


@router.post("/logout")
async def logout(response: Response):
    """
    Remove o cookie do refresh_token para encerrar a sessão de forma segura.
    """
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE)
    return {"message": "Logout realizado."}


