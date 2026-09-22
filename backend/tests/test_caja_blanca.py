"""
PRUEBAS DE CAJA BLANCA
======================
Prueban la estructura interna del código: funciones, ramas lógicas y
validaciones, conociendo cómo están implementadas.
"""
import pytest
from datetime import datetime, timedelta, timezone

from jose import jwt
from pydantic import ValidationError

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    SECRET_KEY,
    ALGORITHM,
)
from app.schemas import UserRegister, TransactionCreate, CategoryCreate


pytestmark = pytest.mark.caja_blanca


# ---------- Hashing de contraseñas ----------

class TestHashPassword:
    def test_hash_es_diferente_al_original(self):
        """El hash nunca debe ser igual a la contraseña en texto plano."""
        password = "MiClave123"
        hashed = hash_password(password)
        assert hashed != password

    def test_hash_es_verificable(self):
        """La contraseña correcta debe verificar contra su hash."""
        password = "MiClave123"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_password_incorrecta_no_verifica(self):
        """Una contraseña distinta no debe verificar."""
        hashed = hash_password("MiClave123")
        assert verify_password("ClaveMala999", hashed) is False

    def test_dos_hashes_del_mismo_password_son_distintos(self):
        """bcrypt usa salt, así que dos hashes del mismo texto difieren."""
        h1 = hash_password("MiClave123")
        h2 = hash_password("MiClave123")
        assert h1 != h2


# ---------- Generación de tokens JWT ----------

class TestCreateAccessToken:
    def test_token_contiene_el_sub(self):
        """El token debe contener el 'sub' que se le pasa."""
        token = create_access_token({"sub": "42"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "42"

    def test_token_tiene_expiracion(self):
        """El token debe incluir un campo de expiración 'exp'."""
        token = create_access_token({"sub": "1"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in payload

    def test_token_expira_en_el_futuro(self):
        """La expiración debe estar en el futuro."""
        token = create_access_token({"sub": "1"})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        assert exp > datetime.now(timezone.utc)

    def test_token_firmado_con_otra_clave_no_valida(self):
        """Un token firmado con otra clave debe fallar al decodificar."""
        token = create_access_token({"sub": "1"})
        with pytest.raises(Exception):
            jwt.decode(token, "clave-incorrecta", algorithms=[ALGORITHM])


# ---------- Validaciones de schemas (ramas lógicas) ----------

class TestValidacionUserRegister:
    def test_password_corta_falla(self):
        with pytest.raises(ValidationError):
            UserRegister(name="Juan", email="a@b.com", password="Ab1")

    def test_password_sin_numero_falla(self):
        with pytest.raises(ValidationError):
            UserRegister(name="Juan", email="a@b.com", password="SoloLetras")

    def test_password_sin_letra_falla(self):
        with pytest.raises(ValidationError):
            UserRegister(name="Juan", email="a@b.com", password="12345678")

    def test_email_invalido_falla(self):
        with pytest.raises(ValidationError):
            UserRegister(name="Juan", email="no-es-email", password="Valida123")

    def test_nombre_muy_corto_falla(self):
        with pytest.raises(ValidationError):
            UserRegister(name="J", email="a@b.com", password="Valida123")

    def test_registro_valido_pasa(self):
        user = UserRegister(name="Juan", email="a@b.com", password="Valida123")
        assert user.email == "a@b.com"


class TestValidacionTransaction:
    def test_amount_negativo_falla(self):
        with pytest.raises(ValidationError):
            TransactionCreate(
                description="Test", amount=-50, category="Comida",
                type="expense", date="2026-01-01",
            )

    def test_amount_cero_falla(self):
        with pytest.raises(ValidationError):
            TransactionCreate(
                description="Test", amount=0, category="Comida",
                type="expense", date="2026-01-01",
            )

    def test_type_invalido_falla(self):
        with pytest.raises(ValidationError):
            TransactionCreate(
                description="Test", amount=100, category="Comida",
                type="regalo", date="2026-01-01",
            )

    def test_descripcion_vacia_falla(self):
        with pytest.raises(ValidationError):
            TransactionCreate(
                description="   ", amount=100, category="Comida",
                type="expense", date="2026-01-01",
            )

    def test_transaction_valida_pasa(self):
        t = TransactionCreate(
            description="Almuerzo", amount=25.5, category="Comida",
            type="expense", date="2026-01-01",
        )
        assert t.amount == 25.5
        assert t.type == "expense"


class TestValidacionCategory:
    def test_color_invalido_falla(self):
        with pytest.raises(ValidationError):
            CategoryCreate(name="Comida", type="expense", color="rojo")

    def test_color_hex_valido_pasa(self):
        c = CategoryCreate(name="Comida", type="expense", color="#ff0000")
        assert c.color == "#ff0000"

    def test_type_invalido_falla(self):
        with pytest.raises(ValidationError):
            CategoryCreate(name="Comida", type="otro", color="#ff0000")
