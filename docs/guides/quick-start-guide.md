# Developer Quick Start Guide

Get the Optimum Solutions Group project running locally in minutes.

---

## Prerequisites

| Requirement | Version |
| ----------- | ------- |
| Node.js | ≥ 20.0.0 |
| npm | ≥ 10.0.0 |

Check: `node -v` and `npm -v`

---

## 1. Clone & Install

```bash
git clone https://github.com/benmed00/optimum-solutions-group.git
cd optimum-solutions-group
npm install
```

---

## 2. Run Development Server

```bash
npm run dev
```

Open **http://localhost:8080** in your browser.

---

## 3. Essential Commands

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build (port 4173) |
| `npm run test` | Run Jest unit tests |
| `npm run cypress:open` | Open Cypress E2E test runner |
| `npm run type-check` | TypeScript check (no emit) |
| `npm run lint` | ESLint |
| `npm run lint:md` | Markdown lint |

---

## 4. Project Structure (Key Paths)

| Path | Contents |
| ---- | -------- |
| `src/App.tsx` | Root app, routing, providers |
| `src/pages/` | Route-level pages (Index, Analytics, etc.) |
| `src/features/` | Feature modules (navigation, hero, contact, etc.) |
| `src/shared/components/` | Reusable UI components |
| `src/shared/services/` | API client, event bus |
| `src/shared/hooks/` | Custom React hooks |
| `docs/` | All documentation |

---

## 5. API & Swagger UI

With `npm run dev` running:

- **Swagger UI:** http://localhost:8080/api-docs
- **API base:** http://localhost:8080/api

See [API README](../api/README.md) for Postman and OpenAPI details.

---

## 6. Next Steps

- [Package Scripts Analysis](package-scripts-analysis.md) — Full npm scripts reference
- [Deployment Guide](deployment-guide.md) — Build and deploy
- [Accessibility Guide](accessibility.md) — WCAG 2.1 AA
- [Platform Mapping & Diagrams](../architecture/platform-mapping-and-diagrams.md) — Architecture overview
