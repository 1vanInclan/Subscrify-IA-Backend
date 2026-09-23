# 🚀 Subscrify IA API - Backend

Subscrify es un backend de alto rendimiento para la gestión inteligente de suscripciones y finanzas personales. Integra una arquitectura limpia en NestJS, persistencia relacional y vectorial con PostgreSQL (pgvector), caché distribuida con Redis, y un agente interactivo impulsado por Google Gemini (Cheems IA) capaz de responder preguntas mediante RAG y ejecutar Function Calling.

---

## 🛠️ Tecnologías y Stacks

- Framework: NestJS (TypeScript)
- Base de Datos: PostgreSQL + pgvector (Búsqueda semántica & embeddings)
- ORM: TypeORM
- Caché & Rate Limiting: Redis + @nestjs/throttler
- IA / LLM: Google GenAI SDK (gemini-2.5-flash)
- Autenticación: JWT (JSON Web Tokens) + Bcrypt
- Documentación & Pruebas API: Bruno (bruno-API/)
- Contenedores: Docker & Docker Compose

---

## 🏗️ Arquitectura del Proyecto

El backend sigue los principios de Clean Architecture estructurado por módulos en NestJS:

src/
├── ai/                 # Módulo de Inteligencia Artificial (Gemini SDK & Tools)
│   ├── ai-tools.service.ts
│   ├── ai.controller.ts
│   └── ai.service.ts
├── auth/               # Autenticación, JWT, Hash de contraseñas y Guards
├── common/             # Servicios compartidos (Módulo global de Redis)
├── documents/          # Ingesta de documentos, generación de embeddings & pgvector
├── subscriptions/      # CRUD de suscripciones con caché e invalidación en Redis
├── users/              # Gestión de usuarios
├── app.module.ts       # Módulo principal y bootstrapping de PostgreSQL/Redis
└── main.ts             # Punto de entrada de la aplicación

---

## ⚡ Características Principales

### 1. Gestión de Suscripciones & Caché en Redis
- CRUD Completo: Creación, lectura, actualización y eliminación de suscripciones.
- In-Memory Caching: Las consultas de suscripciones por usuario (findAllByUser) se almacenan en Redis con un TTL optimizado.
- Cache Invalidation: Invalidación automática del caché en Redis al crear, actualizar o eliminar registros para garantizar inconsistencia cero.

### 2. RAG (Retrieval-Augmented Generation) & Búsqueda Semántica
- Ingesta de notas, políticas, recibos y documentos del usuario.
- Generación de vectores de embedding (768 dimensiones) almacenados directamente en PostgreSQL usando la extensión pgvector.
- Búsqueda por similitud de coseno para recuperar contexto exacto durante las consultas del usuario.

### 3. Agente Financiero con IA (Cheems IA)
- Integración con Google Gemini mediante Function Calling / Tools Declarations.
- Capacidad de consultar el estado financiero, listar suscripciones, calcular gastos mensuales y crear/cancelar servicios dinámicamente mediante lenguaje natural.
- Resiliencia y captura limpia de errores de cuota (429 Too Many Requests).

### 4. Seguridad y Protección
- Autenticación mediante JWT Bearer Tokens.
- Rate Limiting (Throttling) global y estricto en el endpoint de chat /api/ai/chat para proteger las cuotas del proveedor de IA.

---

## ⚙️ Configuración del Entorno local

### 1. Clona el repositorio e instala dependencias:
git clone https://github.com/tu-usuario/subscrify-backend.git
cd subscrify-backend
pnpm install

### 2. Configura las variables de entorno:
Crea un archivo .env basado en la plantilla .env.example:

PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=subscrify_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro

# AI Provider
GEMINI_API_KEY=tu_gemini_api_key

### 3. Levanta los servicios con Docker:
docker compose up -d

*Esto iniciará los contenedores de PostgreSQL (con pgvector preconfigurado) y Redis.*

### 4. Inicia la aplicación en modo desarrollo:
pnpm run start:dev

---

## 🧪 Pruebas de la API

Toda la colección de endpoints de la API está documentada e integrada en el repositorio bajo el nombre Subscrify-IA-Collection para su importacion.

---

## 📌 Principales Endpoints

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | /api/auth/register | Registro de usuario |
| POST | /api/auth/login | Inicio de sesión y generación de JWT |
| GET | /api/subscriptions | Obtiene las suscripciones del usuario (vía Redis Cache) |
| POST | /api/subscriptions | Registra una nueva suscripción (Invalida caché) |
| POST | /api/documents/ingest | Genera embedding y guarda documento en pgvector |
| POST | /api/ai/chat | Chat interactivo con Cheems IA (Rate Limited) |