import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Carrega os segredos do arquivo .env
load_dotenv()

# Configurações do console para vermos mensagens bonitas
logging.basicConfig(level=logging.INFO)

# Pega o link e substitui a tag <db_password> pela senha real
MONGODB_URI = os.getenv("MONGODB_URI", "").replace(
    "<db_password>", os.getenv("MONGODB_PASSWORD", "")
)
DATABASE_NAME = os.getenv("DATABASE_NAME", "financia_db")


class DataBase:
    client: AsyncIOMotorClient | None = None
    db = None


db_instance = DataBase()


async def connect_to_mongo():
    """Função que liga o banco de dados"""
    logging.info("⏳ Conectando ao MongoDB Atlas...")
    try:
        db_instance.client = AsyncIOMotorClient(MONGODB_URI)
        db_instance.db = db_instance.client[DATABASE_NAME]

        # O "ping" força o banco a responder, confirmando que a senha está certa
        await db_instance.client.admin.command("ping")
        logging.info("📦 ✅ Banco de Dados conectado com sucesso!")
    except Exception as e:
        logging.error(f"❌ Erro ao conectar no Banco: {e}")


async def close_mongo_connection():
    """Função que desliga o banco de dados com segurança"""
    logging.info("Desconectando do MongoDB...")
    if db_instance.client:
        db_instance.client.close()
        logging.info("Conexão com o banco fechada de forma segura.")


def get_db():
    """Ferramenta para usarmos o banco nas nossas Rotas depois"""
    return db_instance.db

