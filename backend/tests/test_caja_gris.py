"""
PRUEBAS DE CAJA GRIS (SEGURIDAD)
================================
Prueban la seguridad de la aplicación con conocimiento PARCIAL de la
implementación: sabemos que usa JWT, SQLAlchemy y separación por usuario,
y probamos vectores de ataque conocidos contra esos mecanismos.
"""
import pytest
from jose import jwt

from app.auth import SECRET_KEY, ALGORITHM

pytestmark = pytest.mark.caja_gris


# ---------- Aislamiento de datos entre usuarios (IDOR) ----------

class TestAislamientoUsuarios:
    """Un usuario no debe poder ver ni tocar datos de otro (Insecure Direct Object Reference)."""

    def test_usuario_no_ve_transacciones_de_otro(self, client, auth_headers, second_user):
        # Usuario 1 crea una transacción
        client.post("/api/transactions/", json={
            "description": "Privada", "amount": 500, "category": "Trabajo",
            "type": "income", "date": "2026-01-01",
        }, headers=auth_headers)

        # Usuario 2 lista las suyas: no debe ver la del usuario 1
        response = client.get("/api/transactions/", headers=second_user["headers"])
        assert response.status_code == 200
        assert len(response.json()) == 0

    def test_usuario_no_puede_leer_transaccion_de_otro_por_id(self, client, auth_headers, second_user):
        creada = client.post("/api/transactions/", json={
            "description": "Privada", "amount": 500, "category": "Trabajo",
            "type": "income", "date": "2026-01-01",
        }, headers=auth_headers).json()

        # Usuario 2 intenta acceder por ID directo: debe recibir 404
        response = client.get(
            f"/api/transactions/{creada['id']}", headers=second_user["headers"]
        )
        assert response.status_code == 404

    def test_usuario_no_puede_eliminar_transaccion_de_otro(self, client, auth_headers, second_user):
        creada = client.post("/api/transactions/", json={
            "description": "Privada", "amount": 500, "category": "Trabajo",
            "type": "income", "date": "2026-01-01",
        }, headers=auth_headers).json()

        # Usuario 2 intenta borrarla
        response = client.delete(
            f"/api/transactions/{creada['id']}", headers=second_user["headers"]
        )
        assert response.status_code == 404
        # Confirmar que sigue existiendo para el dueño
        get_resp = client.get(f"/api/transactions/{creada['id']}", headers=auth_headers)
        assert get_resp.status_code == 200

    def test_resumen_no_mezcla_datos_entre_usuarios(self, client, auth_headers, second_user):
        client.post("/api/transactions/", json={
            "description": "U1", "amount": 1000, "category": "Trabajo",
            "type": "income", "date": "2026-01-01",
        }, headers=auth_headers)

        # El resumen del usuario 2 debe estar en cero
        response = client.get("/api/transactions/summary", headers=second_user["headers"])
        data = response.json()
        assert data["total_income"] == 0
        assert data["transaction_count"] == 0


# ---------- Manipulación de tokens JWT ----------

class TestTokensManipulados:
    def test_token_invalido_es_rechazado(self, client):
        headers = {"Authorization": "Bearer token.completamente.falso"}
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401

    def test_token_firmado_con_otra_clave_es_rechazado(self, client, registered_user):
        # Un atacante firma un token con SU propia clave
        fake_token = jwt.encode(
            {"sub": str(registered_user["user"]["id"])},
            "clave-del-atacante",
            algorithm=ALGORITHM,
        )
        headers = {"Authorization": f"Bearer {fake_token}"}
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401

    def test_token_sin_sub_es_rechazado(self, client):
        # Token válidamente firmado pero sin el campo 'sub'
        token = jwt.encode({"data": "x"}, SECRET_KEY, algorithm=ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401

    def test_token_de_usuario_inexistente_es_rechazado(self, client):
        # Token firmado correctamente pero apuntando a un usuario que no existe
        token = jwt.encode({"sub": "999999"}, SECRET_KEY, algorithm=ALGORITHM)
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401

    def test_header_sin_bearer_es_rechazado(self, client, registered_user):
        headers = {"Authorization": registered_user["token"]}  # falta "Bearer "
        response = client.get("/api/auth/me", headers=headers)
        assert response.status_code == 401


# ---------- Inyección SQL ----------

class TestInyeccionSQL:
    """SQLAlchemy usa consultas parametrizadas; estos payloads NO deben ejecutar SQL."""

    def test_sql_injection_en_login(self, client, registered_user):
        # Payload clásico de inyección en el campo email/username
        response = client.post("/api/auth/login", data={
            "username": "' OR '1'='1",
            "password": "' OR '1'='1",
        })
        # Debe fallar como credenciales inválidas, no dar acceso
        assert response.status_code == 401

    def test_sql_injection_en_registro_email(self, client):
        response = client.post("/api/auth/register", json={
            "name": "Hacker",
            "email": "test'; DROP TABLE users;--@test.com",
            "password": "Clave1234",
        })
        # Email inválido -> 422; la tabla users sigue intacta
        assert response.status_code == 422

    def test_sql_injection_en_descripcion_se_guarda_como_texto(self, client, auth_headers):
        payload = {
            "description": "'; DROP TABLE transactions; --",
            "amount": 100,
            "category": "Test",
            "type": "expense",
            "date": "2026-01-01",
        }
        response = client.post("/api/transactions/", json=payload, headers=auth_headers)
        # Se guarda como texto literal, sin ejecutar SQL
        assert response.status_code == 201
        assert response.json()["description"] == "'; DROP TABLE transactions; --"
        # La tabla sigue funcionando
        lista = client.get("/api/transactions/", headers=auth_headers)
        assert lista.status_code == 200


# ---------- XSS almacenado ----------

class TestXSS:
    def test_payload_xss_se_almacena_sin_ejecutar(self, client, auth_headers):
        """El backend guarda el texto tal cual; el escape corresponde al frontend (React lo hace)."""
        xss = "<script>alert('xss')</script>"
        response = client.post("/api/transactions/", json={
            "description": xss, "amount": 50, "category": "Test",
            "type": "expense", "date": "2026-01-01",
        }, headers=auth_headers)
        assert response.status_code == 201
        # Se devuelve tal cual (React escapa al renderizar, evitando ejecución)
        assert response.json()["description"] == xss


# ---------- Headers de seguridad ----------

class TestHeadersSeguridad:
    def test_headers_de_seguridad_presentes(self, client):
        response = client.get("/")
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert "Referrer-Policy" in response.headers
        assert "Strict-Transport-Security" in response.headers


# ---------- Exposición de datos sensibles ----------

class TestExposicionDatos:
    def test_hash_password_nunca_se_expone(self, client, auth_headers):
        response = client.get("/api/auth/me", headers=auth_headers)
        data = response.json()
        assert "hashed_password" not in data
        assert "password" not in data

    def test_login_no_revela_si_email_existe(self, client, registered_user):
        """El mensaje de error debe ser genérico para no filtrar qué emails existen."""
        resp_existe = client.post("/api/auth/login", data={
            "username": registered_user["email"], "password": "malaClave1",
        })
        resp_no_existe = client.post("/api/auth/login", data={
            "username": "fantasma@test.com", "password": "malaClave1",
        })
        # Ambos deben dar el mismo código y mensaje
        assert resp_existe.status_code == resp_no_existe.status_code == 401
        assert resp_existe.json()["detail"] == resp_no_existe.json()["detail"]
