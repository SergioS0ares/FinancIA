from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.routes import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Executa ao ligar o servidor (Nascimento)
    await connect_to_mongo()
    yield
    # Executa ao desligar o servidor (Morte)
    await close_mongo_connection()


app = FastAPI(title="FinancIA Backend", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "🚀 Servidor do FinancIA está VIVO e respirando no Python!"}


app.include_router(auth.router, prefix="/api")

