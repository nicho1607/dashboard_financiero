import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL no está configurada. Copia .env.example a .env y define tus credenciales."
    )

# echo=True solo en desarrollo para no filtrar SQL/datos en logs de producción
engine = create_engine(DATABASE_URL, echo=(ENVIRONMENT == "development"), pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Crear todas las tablas en la base de datos."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependencia para obtener una sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
