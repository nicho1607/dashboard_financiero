"""
PRUEBAS DE CAJA NEGRA
=====================
Prueban el comportamiento de la API desde afuera, a través de sus endpoints,
sin conocer la implementación interna. Solo entradas y salidas esperadas.
"""
import pytest

pytestmark = pytest.mark.caja_negra


# ---------- Endpoint raíz ----------

def test_root_responde_ok(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


# ---------- Registro ----------

class TestRegistro:
    def test_registro_exitoso(self, client):
        response = client.post("/api/auth/register", json={
            "name": "Ana Lopez",
            "email": "ana@test.com",
            "password": "Clave1234",
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "ana@test.com"
        # La contraseña NUNCA debe volver en la respuesta
        assert "password" not in data["user"]
        assert "hashed_password" not in data["user"]

    def test_registro_email_duplicado_falla(self, client):
        payload = {"name": "Ana", "email": "dup@test.com", "password": "Clave1234"}
        client.post("/api/auth/register", json=payload)
        response = client.post("/api/auth/register", json=payload)
        assert response.status_code == 400

    def test_registro_password_debil_falla(self, client):
        response = client.post("/api/auth/register", json={
            "name": "Ana", "email": "ana2@test.com", "password": "123",
        })
        assert response.status_code == 422

    def test_registro_email_invalido_falla(self, client):
        response = client.post("/api/auth/register", json={
            "name": "Ana", "email": "no-email", "password": "Clave1234",
        })
        assert response.status_code == 422


# ---------- Login ----------

class TestLogin:
    def test_login_exitoso(self, client, registered_user):
        response = client.post("/api/auth/login", data={
            "username": registered_user["email"],
            "password": registered_user["password"],
        })
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_password_incorrecta_falla(self, client, registered_user):
        response = client.post("/api/auth/login", data={
            "username": registered_user["email"],
            "password": "ClaveIncorrecta1",
        })
        assert response.status_code == 401

    def test_login_usuario_inexistente_falla(self, client):
        response = client.post("/api/auth/login", data={
            "username": "nadie@test.com",
            "password": "Cualquiera1",
        })
        assert response.status_code == 401


# ---------- Endpoint protegido /me ----------

class TestMe:
    def test_me_con_token_valido(self, client, auth_headers, registered_user):
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["email"] == registered_user["email"]

    def test_me_sin_token_falla(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401


# ---------- CRUD de transacciones ----------

class TestTransacciones:
    def _nueva_transaccion(self):
        return {
            "description": "Salario",
            "amount": 1500.50,
            "category": "Trabajo",
            "type": "income",
            "date": "2026-01-15",
        }

    def test_crear_transaccion(self, client, auth_headers):
        response = client.post(
            "/api/transactions/", json=self._nueva_transaccion(), headers=auth_headers
        )
        assert response.status_code == 201
        assert response.json()["amount"] == 1500.50

    def test_crear_sin_auth_falla(self, client):
        response = client.post("/api/transactions/", json=self._nueva_transaccion())
        assert response.status_code == 401

    def test_listar_transacciones(self, client, auth_headers):
        client.post("/api/transactions/", json=self._nueva_transaccion(), headers=auth_headers)
        response = client.get("/api/transactions/", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_obtener_transaccion_por_id(self, client, auth_headers):
        creada = client.post(
            "/api/transactions/", json=self._nueva_transaccion(), headers=auth_headers
        ).json()
        response = client.get(f"/api/transactions/{creada['id']}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["id"] == creada["id"]

    def test_transaccion_inexistente_da_404(self, client, auth_headers):
        response = client.get("/api/transactions/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_actualizar_transaccion(self, client, auth_headers):
        creada = client.post(
            "/api/transactions/", json=self._nueva_transaccion(), headers=auth_headers
        ).json()
        response = client.put(
            f"/api/transactions/{creada['id']}",
            json={"amount": 2000},
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["amount"] == 2000

    def test_eliminar_transaccion(self, client, auth_headers):
        creada = client.post(
            "/api/transactions/", json=self._nueva_transaccion(), headers=auth_headers
        ).json()
        response = client.delete(f"/api/transactions/{creada['id']}", headers=auth_headers)
        assert response.status_code == 204
        # Verificar que ya no existe
        get_resp = client.get(f"/api/transactions/{creada['id']}", headers=auth_headers)
        assert get_resp.status_code == 404

    def test_crear_con_amount_negativo_falla(self, client, auth_headers):
        payload = self._nueva_transaccion()
        payload["amount"] = -100
        response = client.post("/api/transactions/", json=payload, headers=auth_headers)
        assert response.status_code == 422

    def test_crear_con_tipo_invalido_falla(self, client, auth_headers):
        payload = self._nueva_transaccion()
        payload["type"] = "prestamo"
        response = client.post("/api/transactions/", json=payload, headers=auth_headers)
        assert response.status_code == 422


# ---------- Resumen del dashboard ----------

class TestResumen:
    def test_resumen_calcula_balance(self, client, auth_headers):
        client.post("/api/transactions/", json={
            "description": "Sueldo", "amount": 1000, "category": "Trabajo",
            "type": "income", "date": "2026-01-01",
        }, headers=auth_headers)
        client.post("/api/transactions/", json={
            "description": "Comida", "amount": 300, "category": "Comida",
            "type": "expense", "date": "2026-01-02",
        }, headers=auth_headers)

        response = client.get("/api/transactions/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_income"] == 1000
        assert data["total_expenses"] == 300
        assert data["balance"] == 700
        assert data["transaction_count"] == 2

    def test_resumen_sin_auth_falla(self, client):
        response = client.get("/api/transactions/summary")
        assert response.status_code == 401
