from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.db.mongodb import get_db
from app.models.user import UserCreate, UserResponse
from app.core.security import get_password_hash


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


