from fastapi import APIRouter

from app.api.routes import auth, transactions

api_router = APIRouter()

# auth.router já possui prefix "/auth" em app/api/routes/auth.py
api_router.include_router(auth.router, tags=["Autenticação"])
api_router.include_router(
    transactions.router, prefix="/transactions", tags=["Transações"]
)

