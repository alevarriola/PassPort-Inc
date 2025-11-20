# PassPort-Inc

Panel de autenticación y gestión de usuarios construido con:

- **Backend:** Node.js + Express 5, Prisma ORM (SQLite), JWT en cookie HTTP-only, protección CSRF.
- **Frontend:** React + Vite, React Router, contexto de autenticación y panel de administración.
- **DB:** SQLite (con Prisma) y script de seed para crear un usuario admin.

Es un proyecto ideal como base para:

- Probar flujos de login/logout con cookies seguras.
- Practicar **roles y permisos** (`ADMIN` / `USER`).
- Tener un panel de administración minimalista pero funcional para gestionar usuarios.

---

## Funcionalidades principales

### Autenticación

- Login con email y contraseña.
- Sesión gestionada con **JWT en cookie HTTP-only** (no accesible desde JS).
- Endpoint `/auth/me` para obtener el usuario autenticado.
- Logout que limpia la cookie en el backend.

### Seguridad

- **CSRF** con `csurf` usando cookie de token:
  - Frontend obtiene el token con `GET /csrf-token`.
  - Axios lo envía automáticamente en el header `X-CSRF-Token` en `POST/PUT/DELETE`.
- **Límite de intentos de login**:
  - Después de varios intentos fallidos (`MAX_ATTEMPTS = 5`), el usuario queda bloqueado por 10 minutos.
- Validación de entrada con **Zod** en el backend.

### Gestión de usuarios

- Modelo `User` (via Prisma) con los campos:
  - `id`, `name`, `email` (único), `phone`, `passwordHash`, `role` (`ADMIN` / `USER`), `createdAt`, `updatedAt`.
- Rutas protegidas para usuarios:
  - Listar usuarios (solo admin).
  - Crear usuario (solo admin).
  - Editar usuario (admin o el propio usuario).
  - Eliminar usuario (solo admin, no puede borrarse a sí mismo).

### Frontend (React)

- **Pantallas:**
  - `/login`: formulario de acceso.
  - `/profile`: ver y editar tus propios datos (nombre, email, teléfono).
  - `/admin`: panel para admins con:
    - Tabla de usuarios.
    - Crear nuevo usuario.
    - Editar usuario existente.
    - Borrar usuario.
- **Protección de rutas:**
  - `ProtectedRoute`:
    - Redirige a `/login` si no hay sesión.
    - Si la ruta requiere rol `ADMIN`, redirige a `/profile` si no lo tiene.
- Contexto de autenticación (`AuthContext`):
  - Al montar, llama a `fetchMe()` para detectar sesión activa.
  - Expone `user`, `login`, `logout`, `loading`.

### UI / Estilo

- Tema **oscuro tipo “gamer”** con CSS custom:
  - Paleta en `:root` (`--bg`, `--surface`, `--primary`, `--danger`, etc.).
  - Componentes reutilizables:
    - `.card`, `.btn`, `.table`, `.navbar`, `.container`, `.stack`, `.row`, etc.
- Navbar con opciones según estado:
  - Desconectado: botón “Login”.
  - Conectado: links a `Perfil`, `Admin` (si es admin) y `Salir`.

---

## Estructura del proyecto

```text
PassPort-Inc/
├─ server/               # Backend (API REST + auth + DB)
│  ├─ prisma/
│  │  ├─ schema.prisma   # Modelo User y configuración SQLite
│  │  └─ migrations/     # Migraciones de Prisma
│  ├─ scripts/
│  │  └─ seed.js         # Crea un usuario admin por defecto
│  └─ src/
│     ├─ app.js          # App Express: middlewares, CORS, CSRF, rutas
│     ├─ db.js           # PrismaClient
│     ├─ controllers/    # Lógica de auth y usuarios
│     ├─ helpers/        # Cookie helper, loginAttempts
│     ├─ middlewares/    # isAuth, isAdmin, isSelfOrAdmin
│     ├─ routes/         # /auth, /users
│     ├─ utils/          # jwt sign / verify
│     └─ validators/     # Schemas Zod para auth y users
│
└─ web/                  # Frontend React + Vite
   ├─ index.html
   ├─ vite.config.js
   └─ src/
      ├─ main.jsx        # Render raíz
      ├─ App.jsx         # Definición de rutas
      ├─ api.js          # Cliente Axios + CSRF
      ├─ styles.css      # Estilos globales
      ├─ auth/
      │  ├─ AuthContext.jsx
      │  └─ ProtectedRoute.jsx
      ├─ components/
      │  ├─ NavBar.jsx
      │  ├─ UserForm.jsx
      │  └─ UsersTable.jsx
      └─ pages/
         ├─ Login.jsx
         ├─ Profile.jsx
         └─ Admin.jsx
```

---

## Stack técnico

**Backend (/server)**

- Node.js + Express 5
- Prisma ORM con SQLite
- JWT con jsonwebtoken
- bcryptjs para hash de contraseñas
- Zod para validación
- csurf para CSRF
- cookie-parser, cors, dotenv

**Frontend (/web)**

- React (React 19)
- Vite
- React Router DOM
- Axios (con interceptor para CSRF)
- CSS plano con un set de utilidades y layout preparado.

---

## Puesta en marcha

### 0. Requisitos

- Node.js (versión 18+ recomendada)
- npm o pnpm/yarn (los ejemplos usan npm)

### 1. Clonar el repositorio

``` bash
git clone https://github.com/alevarriola/PassPort-Inc.git
cd PassPort-Inc
```

### 2. Instalar dependencias del servidor

``` bash
cd server
npm install
```

#### 2.1. Variables de entorno

Crear un archivo .env en server/ (ejemplo):
``` bash
# Puerto del backend
PORT=4000

# Base de datos SQLite (ruta por defecto de Prisma)
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="cambiame-por-algo-seguro"
JWT_EXPIRES_IN=3600        # en segundos (1 hora)

# Nombre de la cookie
COOKIE_NAME="access_token"

# Datos del admin de seed (opcionales)
ADMIN_NAME="Admin"
ADMIN_EMAIL="admin@example.com"
ADMIN_PHONE="+595000000000"
ADMIN_PASSWORD="admin123"
```

#### 2.2. Migrar la base de datos

``` bash
npx prisma migrate dev --name init
```

#### 2.3 Seed (crear usuario admin)

``` bash
npm run db:seed
```

#### 2.4 Levantar la API

``` bash
npm run dev
# o
npm start
```
La API quedará disponible en:

- http://localhost:4000

**Endpoints relevantes:**

- GET /health – health check.
- GET /csrf-token – devuelve { csrfToken }.
- /auth/* – autenticación.
- /users/* – gestión de usuarios.


### 3. Instalar dependencias del frontend (si aplica)

Si el frontend también tiene su propio `package.json`:

``` bash
cd ../web
npm install
npm run dev
```

**Por defecto** Vite sirve la app en:

- http://localhost:5173

**Importante:** En server/src/app.js el CORS está configurado con
**origin:** 'http://localhost:5173', así que esa URL debe coincidir con donde levanta el frontend.

---

## Flujo de autenticación

1. El frontend llama a fetchCsrfToken() y guarda el token CSRF.
2. El usuario hace login (POST /auth/login):
- El backend valida con Zod.
- Si es correcto, genera un JWT y lo guarda en una cookie HTTP-only.
- Devuelve los datos del usuario.

3. El frontend guarda el usuario en el AuthContext.

4. Para cada POST/PUT/DELETE, Axios:

- Envía la cookie automáticamente (withCredentials: true).
- Adjunta el header X-CSRF-Token con el token CSRF.

5. El backend protege rutas con:

- isAuth (requiere cookie JWT válida).
- isAdmin (requiere rol ADMIN).
- isSelfOrAdmin (admin o el propio usuario).

---


## API (resumen informal)

- POST /auth/register
    - Crea un usuario (pensado para flujos públicos o futuros).
- POST /auth/login
    - Body: { email, password }
    - Devuelve { user } y setea cookie JWT.
    - Bloquea después de varios intentos fallidos.
- POST /auth/logout
    - Limpia la cookie.
- GET /auth/me
    - Devuelve el usuario autenticado.
- GET /users (admin)
- POST /users (admin)
    - Body esperado: { name, email, phone, password, role? }
- GET /users/:id (self o admin)
- PUT /users/:id (self o admin)
    - Campos: name, email, phone.
- DELETE /users/:id (admin)
    - No permite que el usuario se borre a sí mismo.

---

## Autor

Alejandro Arriola

Programador en constante formación.

---