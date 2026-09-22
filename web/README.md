# Dashboard Financiero (Next.js)

Aplicación full-stack de finanzas personales construida con **Next.js 14 (App Router)**,
**TypeScript**, **Prisma** y **PostgreSQL**. Todo (frontend + API) vive en un solo
proyecto, ideal para desplegar en **Vercel**.

## Características
- Autenticación con JWT (registro, login, sesión protegida)
- Contraseñas hasheadas con bcrypt
- Cada usuario ve solo sus propias transacciones
- Dashboard con gráficas (balance, distribución de gastos, rendimiento mensual)
- Páginas: Dashboard, Transacciones, Reportes, Calendario, Alertas, Configuración
- Modo oscuro / claro
- Formato de moneda latino (143.955,38)

---

## Desarrollo local

### 1. Instalar dependencias
```bash
cd web
npm install
```

### 2. Configurar variables de entorno
Copia `.env.example` a `.env` y completa:
```bash
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/finance_db"
SECRET_KEY="una-clave-larga-y-aleatoria"
```

Genera una SECRET_KEY segura:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Crear las tablas en la base de datos
```bash
npx prisma db push
```

### 4. Arrancar el servidor de desarrollo
```bash
npm run dev
```
Abre http://localhost:3000

---

## Despliegue en Vercel (todo en uno)

### 1. Base de datos gratuita en Neon
1. Crea una cuenta en https://neon.tech
2. Crea un proyecto y copia la **connection string** (empieza con `postgresql://`)

### 2. Subir a GitHub
Asegúrate de que `.env` NO se suba (ya está en `.gitignore`).

### 3. Importar en Vercel
1. En https://vercel.com importa el repositorio
2. **Root Directory:** `web`
3. En **Environment Variables** agrega:
   | Variable | Valor |
   |----------|-------|
   | `DATABASE_URL` | tu connection string de Neon |
   | `SECRET_KEY` | tu clave secreta |
4. Deploy

### 4. Crear las tablas en la base de datos de producción
Una vez desplegado, ejecuta desde tu máquina (con el DATABASE_URL de Neon en `.env`):
```bash
npx prisma db push
```

Listo. La app queda online con frontend y backend en el mismo dominio de Vercel.

---

## Scripts
- `npm run dev` — servidor de desarrollo
- `npm run build` — genera el cliente de Prisma y compila para producción
- `npm run start` — servidor de producción
- `npx prisma studio` — explorador visual de la base de datos
