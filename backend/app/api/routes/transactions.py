from fastapi import APIRouter, Depends, status, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongodb import get_db
from app.api.dependencies import get_current_user
from app.models.transaction import TransacaoCriar, TransacaoResposta

router = APIRouter()


@router.post("/", response_model=TransacaoResposta, status_code=status.HTTP_201_CREATED)
async def criar_transacao(
    transacao: TransacaoCriar,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Salva uma nova transação no MongoDB vinculada ao usuário logado.
    """
    if not current_user or "_id" not in current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não autenticado.",
        )

    nova_transacao = transacao.model_dump()
    nova_transacao["usuario_id"] = str(current_user["_id"])

    resultado = await db.transacoes.insert_one(nova_transacao)
    transacao_salva = await db.transacoes.find_one({"_id": resultado.inserted_id})
    if not transacao_salva:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Falha ao recuperar transação salva.",
        )

    # Monta o response no formato Pydantic (id como string)
    transacao_salva["id"] = str(transacao_salva["_id"])
    transacao_salva.pop("_id", None)
    return transacao_salva


@router.get("/", response_model=list[TransacaoResposta])
async def listar_transacoes(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Retorna as transações do usuário logado.
    """
    if not current_user or "_id" not in current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não autenticado.",
        )

    usuario_id = str(current_user["_id"])
    transacoes: list[dict] = []

    cursor = db.transacoes.find({"usuario_id": usuario_id}).sort("data", -1)
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        transacoes.append(doc)

    return transacoes

