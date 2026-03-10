# API Quick Reference

Condensed reference for the Optimum Solutions Group API. Full spec: [openapi.yaml](openapi.yaml).

---

## Base URLs

| Environment | URL |
| ----------- | --- |
| Local dev | `http://localhost:8080/api` |
| Local preview | `http://localhost:4173/api` |
| Staging | `https://api.staging.optimumsolutions.com/v1` |
| Production | `https://api.optimumsolutions.com/v1` |

---

## Authentication

| Endpoint | Method | Auth | Description |
| -------- | ------ | ---- | ----------- |
| `/auth/login` | POST | Public | Login; returns JWT |
| `/auth/register` | POST | Public | Register new user |
| `/auth/refresh` | POST | Bearer | Refresh access token |
| `/auth/logout` | POST | Bearer | Invalidate session |

**Headers for secured endpoints:** `Authorization: Bearer <token>`

---

## Users

| Endpoint | Method | Auth | Description |
| -------- | ------ | ---- | ----------- |
| `/user/profile` | GET | Bearer | Current user profile |
| `/user/profile` | PUT | Bearer | Update profile |
| `/users` | GET | Bearer | List users (admin) |
| `/users` | POST | Bearer | Create user (admin) |
| `/users/{userId}` | GET | Bearer | Get user by ID |
| `/users/{userId}` | PUT | Bearer | Update user |
| `/users/{userId}` | DELETE | Bearer | Delete user |

---

## Contact

| Endpoint | Method | Auth | Description |
| -------- | ------ | ---- | ----------- |
| `/contact` | POST | Public | Submit contact form |

**Request body (required):** `name`, `email`, `message`. Optional: `company`, `phone`, `projectType`, `budget`, `timeline`.

---

## Analytics

| Endpoint | Method | Auth | Description |
| -------- | ------ | ---- | ----------- |
| `/api/analytics/performance` | POST | Public | Send performance metrics |
| `/api/analytics/report` | GET | Bearer | Analytics report (query: `range`) |

---

## Content (Posts)

| Endpoint | Method | Auth | Description |
| -------- | ------ | ---- | ----------- |
| `/posts` | GET | Public | List posts |
| `/posts` | POST | Bearer | Create post |
| `/posts/{id}` | GET | Public | Get post |
| `/posts/{id}` | PUT | Bearer | Update post |
| `/posts/{id}` | DELETE | Bearer | Delete post |

---

## Common Response Shapes

**Success (single):** `{ data: T }`  
**Success (list):** `{ data: T[], meta: { page, limit, total } }`  
**Error:** `{ error: string, code?: string, details?: object[] }`

---

## Frontend Usage (apiClient)

```typescript
import { apiClient } from '@/shared/services/apiClient';

// GET
const profile = await apiClient.get<UserProfile>('/user/profile', { baseUrl });

// POST
const result = await apiClient.post<ContactResponse>('/contact', { name, email, message });

// With config
await apiClient.post('/api/analytics/performance', payload, {
  baseUrl: import.meta.env.VITE_API_URL,
  timeout: 5000,
  retries: 1,
});
```
