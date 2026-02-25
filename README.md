# Monorepo: Angular + Spring Boot + PostgreSQL

Monorepo con frontend Angular y backend Spring Boot 3 sobre PostgreSQL. Incluye autenticación JWT, registro de usuarios y área privada **Sucursal Virtual (SV)** con navegación y páginas de producto, pagos, transferencias, documentos y finanzas.

## Estructura

- **backend/** – Spring Boot 3, JWT, registro y login, CRUD de usuarios (ADMIN), PostgreSQL (producción) / H2 (tests), API documentada con OpenAPI/Swagger (esquemas de error completos).
- **frontend/** – Angular (standalone), área pública (landing, productos, ayuda), área SV (login, registro, home, productos, pagos, transferencias, documentos, finanzas), auth/role guards, componentes compartidos (Toast, Card, Button, ConfirmDialog), diseño con tokens SCSS, nginx en Docker.
- **docker-compose.yml** – Servicios: `postgres`, `backend`, `frontend`.

## Stack

- **BD:** PostgreSQL 16 (Alpine). La base `demo` se crea automáticamente al iniciar el contenedor (`POSTGRES_DB=demo`).
- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), JPA/Hibernate, Maven. Observabilidad (correlation ID, logging JSON en prod), manejo de errores unificado (BaseException, ErrorResponse + FieldError, GlobalExceptionHandler), Bean Validation en DTOs. Respuestas de usuario sin contraseña (id, fullName, documentType, documentNumber, email, phone, enabled, createdAt, updatedAt, roles).
- **Frontend:** Angular, TypeScript, reactive forms, signals, diseño con tokens SCSS y variables CSS, tema claro/oscuro, rutas públicas y área SV con lazy loading, nginx en Docker.

## Ejecución

### Con Docker (stack completo)

```bash
docker compose up --build
```

**Servicios y URLs:**

| Servicio   | URL / Puerto              | Notas                          |
|-----------|---------------------------|--------------------------------|
| Frontend  | http://localhost:4200     | SPA; las llamadas `/api/*` van al backend vía nginx |
| Backend   | http://localhost:8080     | API REST                       |
| PostgreSQL| localhost:5432            | Usuario `demo`, contraseña `PasswordO1.`, base `demo` |

La base de datos `demo` se crea sola la primera vez que arranca el contenedor Postgres (no hace falta init ni script).

### Desarrollo local

**Solo Postgres en Docker (opcional):**

```bash
docker compose up postgres -d
```

**Backend:**

```bash
cd backend
mvn spring-boot:run
```

Usa por defecto `application.yml`: PostgreSQL en `localhost:5432`, base `demo`, usuario `demo`. Si Postgres corre en Docker con el compose, la base ya existe.

**Frontend:**

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Abrir http://localhost:4200. La API está en `http://localhost:8080` (`src/environments/environment.ts`). CORS en el backend permite `http://localhost:4200`.

## Áreas de la aplicación (frontend)

- **Pública:** `/` (landing), `/products`, `/help`. Navbar con enlace "Ingresar a Sucursal Virtual" → `/sv/login`.
- **Login / Registro:** `/sv/login`, `/sv/registro` (formulario con fullName, tipo y número de documento, email, teléfono, contraseña y confirmación; validaciones y política de contraseña).
- **Sucursal Virtual (SV), área privada:** Tras login se redirige a `/sv/home`. Sidebar con: Home, Productos, Pagos, Transferencias, Documentos, Finanzas. Páginas con datos mock (cuentas de ahorro, tarjetas, pagos, transferencias con modal "Inscribir nueva cuenta", documentos descargables, finanzas "Próximamente").

## Login por defecto

- **Email:** admin@local  
- **Contraseña:** Admin123!

## Ejemplos de API (curl)

Las respuestas de `/api/auth/me` y `/api/users` devuelven todos los campos del usuario **excepto la contraseña**: `id`, `fullName`, `documentType`, `documentNumber`, `email`, `phone`, `enabled`, `createdAt`, `updatedAt`, `roles`.

```bash
# Login
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local","password":"Admin123!"}'

# Registro (público)
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Maria Lopez","documentType":"CC","documentNumber":"11223344","email":"maria@example.com","phone":"+5711122233","password":"SecurePass1","confirmPassword":"SecurePass1"}'

# Me (use token from login)
curl -s http://localhost:8080/api/auth/me -H "Authorization: Bearer <ACCESS_TOKEN>"

# List users (ADMIN)
curl -s http://localhost:8080/api/users -H "Authorization: Bearer <ACCESS_TOKEN>"

# Create user (ADMIN)
curl -s -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"email":"user@example.com","password":"UserPass1!","roleNames":["USER"]}'

# Update user (ADMIN)
curl -s -X PUT http://localhost:8080/api/users/2 \
  -H "Content-Type: application/json" -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"email":"user@example.com","enabled":true,"roleNames":["USER","ADMIN"]}'

# Delete user (ADMIN)
curl -s -X DELETE http://localhost:8080/api/users/2 -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Refactors y planes ejecutados

### Frontend (Angular)

- **Estilos y diseño:** Variables CSS y tokens SCSS (`--color-primary`, `--color-bg`, etc.), tema opcional oscuro (`[data-theme="dark"]`), sección Resumen con tarjetas uniformes (mismo estilo y jerarquía de texto).
- **Componentes compartidos:** `ToastComponent` + `ToastService`, `ButtonComponent` (variantes, loading), `CardComponent`, `ConfirmDialogComponent` (sustituye `confirm()`).
- **Área pública:** Layout con navbar (Inicio, Products, Help) y enlace a Sucursal Virtual; rutas lazy-loaded para landing, productos y ayuda.
- **Sucursal Virtual (SV):** Login (`/sv/login`) y registro (`/sv/registro`) con formularios reactivos, validación y política de contraseña; tras login redirección a `/sv/home`. Sidebar con `routerLink`/`routerLinkActive` a Home, Productos, Pagos, Transferencias, Documentos, Finanzas. Páginas con datos mock (servicio `SvProductsService`), modal de inscripción de cuenta para transferencias, listado de documentos con descarga.
- **Build:** `tsconfig.app.json` excluye `**/*.spec.ts` del build de la app para evitar errores de tipos de test (Jasmine) en compilación.

### Backend (Spring Boot)

- **Observabilidad:** Correlation ID en cabecera `X-Correlation-ID` y MDC (`CorrelationIdFilter`); logging estructurado JSON en perfil `prod` (Logback + logstash-logback-encoder).
- **Errores:** Jerarquía `BaseException` (ResourceNotFoundException, DuplicateEmailException, DuplicateDocumentException, CustomBusinessException), DTO `ErrorResponse` (message, status, path, correlationId, timestamp, errors con `FieldError`), `GlobalExceptionHandler` único.
- **Auth y usuarios:** Registro `POST /api/auth/register` (fullName, documentType, documentNumber, email, phone, password, confirmPassword); respuestas de `/api/auth/me` y `/api/users` con todos los campos excepto contraseña (incl. documentType, documentNumber, phone, createdAt, updatedAt).
- **API:** OpenAPI/Swagger (springdoc-openapi); registro de esquemas referenciados (p. ej. `FieldError`) en `OpenApiConfig` para que Swagger UI resuelva las referencias sin errores; seguridad Bearer JWT documentada; validación Bean Validation en DTOs.
- **Arquitectura en capas:** Lógica en servicios; controladores delegan (p. ej. `/api/auth/me` usa `AuthService.getProfileByUsername`).

## Notas

- **Base de datos `demo`:** Se crea automáticamente al arrancar el contenedor Postgres gracias a `POSTGRES_DB=demo`. No se requiere servicio de init.
- **Frontend en Docker:** Se usa `environment.docker.ts` (apiUrl vacío); la app llama a `/api` y nginx hace proxy al backend.
- **Tests del backend:** `mvn test` usa H2 con perfil `test`; los datos de prueba para integración los aporta `TestDataConfig`. Crear usuario en tests requiere contraseña de al menos 8 caracteres (validación en `UserCreateDto`).
- **Documentación API:** Con el backend en marcha, Swagger UI está en `http://localhost:8080/swagger-ui.html`. Los esquemas de error (`ErrorResponse`, `FieldError`) se registran en `OpenApiConfig` para evitar errores de referencia en la UI.
- **Postman / API directa:** Para probar la API (p. ej. `GET /api/auth/me` con Bearer token), usa la URL del **backend**: `http://localhost:8080/api/...`. Si usas `http://localhost:4200/api/...`, solo funciona cuando el frontend en Docker (nginx) está levantado y hace proxy; con `ng serve` no hay proxy y esa URL no llega al backend. El JWT expira en 1 hora (configurable con `APP_JWT_EXPIRATION_SECONDS`).
