from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TransacaoCriar(BaseModel):
    """
    Payload para criar uma transação manualmente.
    """

    # Ex.: "receita" ou "despesa"
    tipo: str = Field(..., min_length=1, description="Ex: 'receita' ou 'despesa'")
    categoria: Optional[str] = Field(default=None)
    valor: float = Field(..., description="Valor da transação")
    descricao: Optional[str] = Field(default=None)
    data: Optional[datetime] = Field(default=None)


class TransacaoResposta(BaseModel):
    """
    Resposta da transação salva no MongoDB.
    """

    id: str
    usuario_id: str
    tipo: str
    categoria: Optional[str] = None
    valor: float
    descricao: Optional[str] = None
    data: Optional[datetime] = None

