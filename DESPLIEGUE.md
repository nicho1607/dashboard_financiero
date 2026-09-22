# Guía de Despliegue y Seguridad

Este proyecto tiene dos partes que se despliegan por separado:

- **Frontend** (React + Vite) → se despliega en **Vercel**
- **Backend** (FastAPI + PostgreSQL) → se despliega en **Render** (Vercel no es ideal para un backend con conexión persistente a base de datos)

---

## 1. Seguridad: qué ya está protegido

- Los archivos `.env` (con credenciales de la base de datos y la clave JWT) están en `.gitignore` y **nunca** se suben al repositorio.
- Se incluyen archivos `.env.example` como plantilla, sin secretos reales.
- CORS ya no está abierto (`*`); se controla con la variable `CORS_ORIGINS`.
- Los logs de SQL (`echo`) solo se activan en desarrollo.
- La `SECRET_KEY` es obligatoria en producción (la app no arranca sin ella).
- Las contraseñas se guardan hasheadas con bcrypt, nunca en texto plano.
- Cada usuario solo puede ver y modificar sus propias transacciones.

### Importante antes de subir a GitHub
Como el archivo `.env` con tus credenciales ya existía localmente, verifica que Git NO lo esté rastreando:

```bash
git rm --cached backend/.env frontend/.env
```

(Si el archivo nunca se agregó a Git, este comando simplemente no hará nada.)

Además, **genera una SECRET_KEY nueva para producción** (no reutilices la de desarrollo):

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 2. Base de datos en producción

Necesitas una PostgreSQL accesible desde internet. Opciones gratuitas:
- **Neon** (https://neon.tech) — recomendado
- **Supabase** (https://supabase.com)
- **Render PostgreSQL**

Copia la URL de conexión que te den. Debe tener el formato:

```
postgresql+psycopg://usuario:contraseña@host:puerto/basedatos
```

> Nota: si la URL empieza con `postg://` o `postgresql://`, cámbiala a `postgresql+psycopg://` para que use el driver correcto.

---

## 3. Desplegar el Backend en Render

1. Sube el proyecto a GitHub (asegúrate de que `.env` NO esté incluido).
2. En https://render.com crea un nuevo **Web Service** apuntando a tu repo.
3. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. En **Environment Variables** agrega:
   | Variable | Valor |
   |----------|-------|
   | `DATABASE_URL` | tu URL de PostgreSQL en producción |
   | `SECRET_KEY` | la clave que generaste |
   | `CORS_ORIGINS` | la URL de tu frontend (ej: `https://tu-app.vercel.app`) |
   | `ENVIRONMENT` | `production` |
5. Deploy. Anota la URL que te da Render (ej: `https://dashboard-financiero-api.onrender.com`).

---

## 4. Desplegar el Frontend en Vercel

1. En https://vercel.com importa el mismo repo de GitHub.
2. Configura:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (se detecta solo)
3. En **Environment Variables** agrega:
   | Variable | Valor |
   |----------|-------|
   | `VITE_API_URL` | `https://tu-backend.onrender.com/api` |
4. Deploy.

---

## 5. Conectar ambos

1. Copia la URL final de Vercel (ej: `https://tu-app.vercel.app`).
2. Vuelve a Render y pon esa URL en la variable `CORS_ORIGINS`.
3. Guarda: Render redesplegará el backend con el CORS correcto.

Listo. El frontend en Vercel se comunica con el backend en Render, y las credenciales quedan seguras en variables de entorno.
