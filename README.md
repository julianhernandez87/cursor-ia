# Monorepo: Angular + Spring Boot + PostgreSQL

Monorepo con frontend Angular, backend Spring Boot 3 y base de datos PostgreSQL. Incluye autenticación JWT y CRUD de usuarios (rol ADMIN).

## Estructura

- **backend/** – Spring Boot 3, JWT, User CRUD (ADMIN), PostgreSQL (producción) / H2 (tests), API documentada con OpenAPI/Swagger
- **frontend/** – Angular (standalone), login, usuarios, auth guard, componentes compartidos (Toast, Card, Button, ConfirmDialog), nginx
- **docker-compose.yml** – Servicios: `postgres`, `backend`, `frontend`

## Stack

- **BD:** PostgreSQL 16 (Alpine). La base `demo` se crea automáticamente al iniciar el contenedor (`POSTGRES_DB=demo`).
- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), JPA/Hibernate, Maven. Observabilidad (correlation ID, logging JSON en prod), manejo de errores unificado (BaseException, ErrorResponse, GlobalExceptionHandler), Bean Validation en DTOs.
- **Frontend:** Angular, TypeScript, reactive forms, signals, estilos globales con variables CSS y tema claro/oscuro, nginx en Docker.

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

## Login por defecto

- **Email:** admin@local  
- **Contraseña:** Admin123!

## Ejemplos de API (curl)

```bash
# Login
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@local","password":"Admin123!"}'

# Me (use token from login)
curl -s http://localhost:8080/api/auth/me -H "Authorization: Bearer <ACCESS_TOKEN>"

# List users (ADMIN)
curl -s http://localhost:8080/api/users -H "Authorization: Bearer <ACCESS_TOKEN>"

# Create user
curl -s -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"email":"user@example.com","password":"UserPass1!","roleNames":["USER"]}'

# Update user
curl -s -X PUT http://localhost:8080/api/users/2 \
  -H "Content-Type: application/json" -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"email":"user@example.com","enabled":true,"roleNames":["USER","ADMIN"]}'

# Delete user
curl -s -X DELETE http://localhost:8080/api/users/2 -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Refactors realizados

### Frontend (Angular)

- **Estilos globales:** Variables CSS (`--color-primary`, `--color-bg`, etc.) y tema opcional oscuro (`[data-theme="dark"]`).
- **Componentes compartidos:** `ToastComponent` + `ToastService` (feedback éxito/error), `ButtonComponent` (variantes, loading), `CardComponent`, `ConfirmDialogComponent` (sustituye `confirm()`).
- **Login y usuarios:** Formularios reactivos con validación (email, contraseña mín. 8 caracteres), mensajes de error en campos tocados/enviados, toasts para feedback y diálogo de confirmación para borrar usuarios.

### Backend (Spring Boot)

- **Observabilidad:** Correlation ID en cabecera `X-Correlation-ID` y MDC (`CorrelationIdFilter`); logging estructurado JSON en perfil `prod` (Logback + logstash-logback-encoder).
- **Errores:** Jerarquía `BaseException` (ResourceNotFoundException, DuplicateEmailException, CustomBusinessException), DTO `ErrorResponse` (message, status, path, correlationId, timestamp, errors), `GlobalExceptionHandler` único; sin try-catch en controladores.
- **API:** OpenAPI/Swagger (springdoc-openapi), seguridad Bearer JWT y respuestas de error estándar documentadas; validación Bean Validation en DTOs (`@Valid`, `@NotBlank`, `@Email`, `@Size(min=8)` en password).
- **Arquitectura en capas:** Lógica de negocio en servicios; controladores solo delegan (p. ej. `/api/auth/me` usa `AuthService.getProfileByUsername`).

## Notas

- **Base de datos `demo`:** Se crea automáticamente al arrancar el contenedor Postgres gracias a `POSTGRES_DB=demo`. No se requiere servicio de init.
- **Frontend en Docker:** Se usa `environment.docker.ts` (apiUrl vacío); la app llama a `/api` y nginx hace proxy al backend.
- **Tests del backend:** `mvn test` usa H2 con perfil `test`; los datos de prueba para integración los aporta `TestDataConfig`. Crear usuario en tests requiere contraseña de al menos 8 caracteres (validación en `UserCreateDto`).
- **Documentación API:** Con el backend en marcha, Swagger UI está en `http://localhost:8080/swagger-ui.html`.
- **Postman / API directa:** Para probar la API (p. ej. `GET /api/auth/me` con Bearer token), usa la URL del **backend**: `http://localhost:8080/api/...`. Si usas `http://localhost:4200/api/...`, solo funciona cuando el frontend en Docker (nginx) está levantado y hace proxy; con `ng serve` no hay proxy y esa URL no llega al backend. El JWT expira en 1 hora (configurable con `APP_JWT_EXPIRATION_SECONDS`).
