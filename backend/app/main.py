import os

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

app = FastAPI(title="Dashboard Financiero API", version="1.0.0")

# CORS: leer orígenes permitidos desde variable de entorno (separados por coma)
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Importar y registrar rutas
from app.database import init_db
from app.routes import transactions, categories, auth

# Crear tablas
try:
    init_db()
except Exception as e:
    print(f"Error al inicializar BD: {e}")

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])


@app.get("/")
def root():
    return {"message": "Dashboard Financiero API funcionando"}
