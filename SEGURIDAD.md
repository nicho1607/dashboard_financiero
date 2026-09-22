# Seguridad y Pruebas

Documento de los protocolos de ciberseguridad aplicados al proyecto y la suite
de pruebas de caja (blanca, negra y gris).

---

## 1. Protocolos de ciberseguridad aplicados

### Autenticación y contraseñas
- **Hashing con bcrypt**: las contraseñas nunca se guardan en texto plano. Se usa bcrypt con salt automático (dos hashes del mismo texto son distintos).
- **Contraseñas fuertes**: mínimo 8 caracteres, al menos una letra y un número (validado en el registro).
- **Tokens JWT firmados**: la sesión usa JSON Web Tokens firmados con `SECRET_KEY`. Expiran en 24 horas.
- **SECRET_KEY obligatoria en producción**: la app no arranca en producción si no está configurada.

### Autorización y aislamiento de datos
- Todas las rutas de transacciones y categorías requieren token válido.
- Cada transacción está ligada a su `user_id`. Un usuario **solo** puede ver, editar o borrar sus propias transacciones (previene IDOR — Insecure Direct Object Reference).
- El acceso por ID directo a un recurso ajeno devuelve `404`, sin filtrar su existencia.

### Validación de entradas
- `amount` debe ser mayor a 0.
- `type` solo acepta `income` o `expense`.
- `color` debe ser hexadecimal válido.
- Campos de texto con longitud mínima/máxima y sin espacios vacíos.
- Emails validados con `EmailStr`.

### Protección contra ataques comunes
- **Inyección SQL**: SQLAlchemy usa consultas parametrizadas. Los payloads de inyección se guardan como texto literal, nunca se ejecutan.
- **XSS**: el backend almacena el texto tal cual; React escapa automáticamente al renderizar, evitando ejecución de scripts.
- **Clickjacking**: header `X-Frame-Options: DENY`.
- **MIME sniffing**: header `X-Content-Type-Options: nosniff`.
- **Fuerza bruta**: rate limiting de 100 peticiones por minuto por IP.
- **Fuga de información en login**: el mensaje de error es genérico ("Email o contraseña incorrectos") para no revelar qué emails existen.

### Cabeceras de seguridad HTTP (middleware)
| Cabecera | Valor | Protege contra |
|----------|-------|----------------|
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `Referrer-Policy` | `no-referrer` | Fuga de URLs |
| `Permissions-Policy` | cámara/micrófono/ubicación deshabilitados | Abuso de APIs |
| `Strict-Transport-Security` | `max-age=31536000` | Downgrade a HTTP |

### Gestión de secretos
- Los archivos `.env` (credenciales de BD y clave JWT) están en `.gitignore`.
- CORS restringido a orígenes concretos vía variable `CORS_ORIGINS` (no `*`).
- Logs de SQL (`echo`) solo activos en desarrollo.

---

## 2. Pruebas de caja

Se implementaron **59 pruebas automatizadas** con `pytest`, divididas en los tres tipos:

### Caja Blanca (22 pruebas) — `tests/test_caja_blanca.py`
Prueban la **estructura interna**: funciones y ramas lógicas conociendo la implementación.
- Hashing de contraseñas (hash distinto al original, verificación, salt).
- Generación y firma de tokens JWT (contenido, expiración, firma).
- Validaciones de los schemas (contraseñas, montos, tipos, colores).

### Caja Negra (21 pruebas) — `tests/test_caja_negra.py`
Prueban el **comportamiento externo** de la API sin mirar el código, solo entradas/salidas.
- Registro (exitoso, duplicado, datos inválidos).
- Login (exitoso, credenciales incorrectas, usuario inexistente).
- Endpoint protegido `/me`.
- CRUD completo de transacciones.
- Cálculo del resumen del dashboard.

### Caja Gris (16 pruebas) — `tests/test_caja_gris.py`
Prueban la **seguridad** con conocimiento parcial de la implementación (sabemos que usa JWT, SQLAlchemy, separación por usuario).
- Aislamiento de datos entre usuarios (IDOR).
- Manipulación de tokens JWT (firmados con otra clave, sin `sub`, de usuario inexistente).
- Inyección SQL en login, registro y campos de texto.
- XSS almacenado.
- Presencia de cabeceras de seguridad.
- No exposición de contraseñas ni de qué emails existen.

---

## 3. Cómo ejecutar las pruebas

Desde la carpeta `backend`:

```bash
# Instalar dependencias (incluye pytest y httpx)
pip install -r requirements.txt

# Ejecutar TODAS las pruebas
python -m pytest

# Ejecutar solo un tipo (usando los marcadores)
python -m pytest -m caja_blanca
python -m pytest -m caja_negra
python -m pytest -m caja_gris

# Ejecutar un archivo específico
python -m pytest tests/test_caja_gris.py
```

Las pruebas usan una base de datos **SQLite en memoria**, así que no tocan tu
base de datos real de PostgreSQL ni requieren que el servidor esté corriendo.

---

## 4. Recomendaciones adicionales para producción

- Generar una `SECRET_KEY` nueva y única: `python -c "import secrets; print(secrets.token_urlsafe(32))"`.
- Usar HTTPS siempre (Vercel y Render lo dan automáticamente).
- Para rate limiting con múltiples instancias del backend, migrar a Redis.
- Rotar la `SECRET_KEY` periódicamente.
- Configurar copias de seguridad de la base de datos.
