"""
Configuración compartida para las pruebas.
Usa una base de datos SQLite en memoria para no tocar la BD real de PostgreSQL.
"""
import os

# Configurar entorno de prueba ANTES de importar la app
os.environ["SECRET_KEY"] = "clave-de-prueba-para-tests-1234567890"
os.environ["ENVIRONMENT"] = "development"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["CORS_ORIGINS"] = "http://localhost:5173"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app

# Motor SQLite en memoria compartido entre conexiones
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_database():
    """Crea las tablas antes de cada prueba y las borra al terminar."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Sesión de base de datos de prueba."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    """Cliente HTTP de prueba con la BD de test inyectada."""
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client):
    """Registra un usuario y devuelve sus datos + token."""
    payload = {
        "name": "Usuario Prueba",
        "email": "prueba@test.com",
        "password": "Password123",
    }
    response = client.post("/api/auth/register", json=payload)
    data = response.json()
    return {
        "token": data["access_token"],
        "user": data["user"],
        "password": payload["password"],
        "email": payload["email"],
    }


@pytest.fixture
def auth_headers(registered_user):
    """Cabeceras de autorización con el token del usuario registrado."""
    return {"Authorization": f"Bearer {registered_user['token']}"}


@pytest.fixture
def second_user(client):
    """Un segundo usuario distinto, para probar aislamiento de datos."""
    payload = {
        "name": "Otro Usuario",
        "email": "otro@test.com",
        "password": "Otra1234",
    }
    response = client.post("/api/auth/register", json=payload)
    data = response.json()
    return {
        "token": data["access_token"],
        "user": data["user"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"},
    }
