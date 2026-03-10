# Optimum Solutions Group API

Postman collection and OpenAPI (Swagger) specification for the platform API.

## Contents

| File | Description |
| ---- | ----------- |
| [quick-reference.md](quick-reference.md) | Condensed API reference (endpoints, auth, examples) |
| `openapi.yaml` | OpenAPI 3.1 specification (Swagger-compatible) |
| `postman-collection.json` | Postman Collection v2.1 with mocks and examples |
| `postman-environment.json` | Local development environment |
| `postman-environment-staging.json` | Staging environment |
| `postman-environment-production.json` | Production environment |

## Documentation dans le navigateur

Avec le serveur de dev (`npm run dev`) ou de preview (`npm run preview`), ouvrez :

- **http://localhost:8080/api-docs** ou **http://localhost:8080/api** (dev)
- **http://localhost:4173/api-docs** ou **http://localhost:4173/api** (preview)

Un middleware Vite réécrit `/api` et `/api-docs` vers la page Swagger UI.

## Quick Start

### Postman

1. **Import collection**
   - Open Postman → Import → Upload `postman-collection.json`

2. **Import environment**
   - Import → Upload `postman-environment.json`
   - Select "Optimum Solutions Group - Local" in the environment dropdown

3. **Authenticate**
   - Run `Authentication > Login - Success (Mock)`
   - Token is stored in `auth_token` for secured requests

### OpenAPI / Swagger

- **Swagger UI**: Use [Swagger Editor](https://editor.swagger.io/) or any OpenAPI viewer; load `openapi.yaml`
- **Postman**: Import `openapi.yaml` to generate a collection from the spec
- **Codegen**: Use OpenAPI Generator for client/server stubs

## API Overview

| Tag | Endpoints | Auth |
| --- | --------- | ---- |
| **Authentication** | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout` | Public / Bearer |
| **Users** | `GET/PUT /user/profile`, `GET/POST /users`, `GET/PUT/DELETE /users/:id` | Bearer |
| **Contact** | `POST /contact` | Public |
| **Analytics** | `POST /analytics`, `POST /analytics/performance`, `GET /analytics/report` | Public / Bearer |
| **Content** | `GET/POST /posts`, `GET/PUT/DELETE /posts/:id` | Public / Bearer |

## Nomenclature

- **Paths**: kebab-case, plural resources (`/user/profile`, `/users`, `/analytics/report`)
- **Methods**: RESTful (GET, POST, PUT, DELETE)
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Responses**: JSON with `data`/`meta` for lists, `error`/`code` for errors

## Mock Examples

The Postman collection includes response examples for:

- Login success / invalid credentials
- User profile, list, CRUD
- Contact form submission (success, validation error)
- Analytics events batch, performance metrics, report
- Posts list and CRUD

## Base URLs

| Environment | Base URL |
| ----------- | -------- |
| Local | `http://localhost:4173/api` |
| Staging | `https://api.staging.optimumsolutions.com/v1` |
| Production | `https://api.optimumsolutions.com/v1` |

## Postman Mock Server

To test without a backend, create a Postman Mock Server from the collection:

1. In Postman, open the collection → **...** → **Mock collection**
2. Create a mock server and copy its URL (e.g. `https://xxx.postman.co/mock/...`)
3. Create a new environment with `base_url` set to the mock server URL
4. Run requests; they will return the saved example responses
