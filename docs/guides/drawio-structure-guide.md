# Draw.io Structure Guide — Optimum Solutions Group

Guide to recreate or extend the platform diagrams in Draw.io (diagrams.net).

---

## 1. Setup

1. Open [diagrams.net](https://app.diagrams.net/) or the VS Code Draw.io extension
2. Create a new diagram or open `docs/architecture/optimum-platform.drawio` (if present)

---

## 2. Diagram Types & Structure

### 2.1 Class Diagram

| Shape | Purpose |
| ----- | ------- |
| Rectangle | Class (ApiError, ApiClient, EventBus, ErrorBoundary, etc.) |
| Compartment | Attributes (top), methods (bottom) |
| Dashed arrow | Dependency / uses |
| Solid arrow | Inheritance (ApiError → Error) |

**Layers:**

- **Core services:** ApiClient, ApiError, EventBus
- **React:** ErrorBoundary, AccessibilityProvider
- **Monitoring:** PerformanceMonitor, PerformanceMetrics
- **PWA:** ServiceWorkerManager

### 2.2 Component Diagram

| Shape | Purpose |
| ----- | ------- |
| Container (rounded) | App, Pages, Features, Shared, Services |
| Component (box) | Individual components |
| Solid arrow | Composition / contains |
| Dotted arrow | Uses / calls |

**Hierarchy:**

```
App
├── ErrorBoundary
├── AccessibilityProvider
├── QueryClientProvider
├── BrowserRouter
└── Pages
    ├── Index
    ├── AnalyticsPage
    ├── ComponentShowcase
    ├── PWAPage
    └── NotFound
└── Features (Navigation, Hero, About, Services, IoT, Portfolio, Testimonials, Contact)
└── Shared (ProjectEstimator, FAQSection, PWAInstallPrompt, Footer, BackToTop, SEOHead)
└── Services (apiClient, eventBus, performanceMonitor)
```

### 2.3 C4 Model (Context & Container)

**Level 1 — System Context:**

- **Person:** Visitor, User (stick figures)
- **System:** Web Application (rounded rectangle)
- **External:** Optimum API, Google Analytics (cylinder/database style)
- **Relations:** "Browse", "Contact", "REST", "Events"

**Level 2 — Container:**

- **Container:** React SPA, Service Worker
- **External:** Visitor, Backend API

### 2.4 Deployment Diagram

| Shape | Purpose |
| ----- | ------- |
| Node (3D box) | Dev, Build, Hosting, API, Client |
| Artifact | dist/, Service Worker, manifest.json |
| Arrow | Deploy / serve |

**Flow:** Dev (Vite) → Build (Rollup) → Hosting (CDN) → Client (Browser)

### 2.5 Entity-Relationship Diagram

| Shape | Purpose |
| ----- | ------- |
| Entity (rectangle) | User, Contact, Post, AnalyticsEvent, etc. |
| Attribute (oval) | id, email, name, etc. |
| Relationship (diamond) | authors, belongs to |
| Cardinality | 1:1, 1:N, N:M |

**Entities:** User, Contact, AnalyticsEvent, AnalyticsSession, Post, PerformanceMetrics

### 2.6 State Diagram

| Shape | Purpose |
| ----- | ------- |
| Rounded rectangle | State (Ready, Error, Idle, Submitting) |
| Arrow | Transition (event / action) |
| Black circle | Initial state |
| Bullseye | Final state |

**Examples:** ErrorBoundary (Ready ↔ Error), Contact Form (Idle → Editing → Submitting → Success/Error)

### 2.7 Sequence Diagram

| Shape | Purpose |
| ----- | ------- |
| Lifeline (vertical) | Participant (User, Browser, App, etc.) |
| Arrow | Message (solid = sync, dashed = async) |
| Activation box | Active processing |
| Note | Comment / alt/loop |

---

## 3. Nomenclature

| Rule | Example |
| ---- | ------- |
| Use descriptive, domain-specific names | `platform-architecture`, not `Untitled Diagram` |
| Include format: `{name}.drawio.png` or `.svg` | `platform-architecture.drawio.png` |
| Consistent naming across PNG/SVG | Same base name for both exports |
| Lowercase, hyphenated | `platform-architecture`, `c4-context` |

## 4. Draw.io Tips

1. **Layers:** Use layers for each diagram type to switch views
2. **Styles:** Define a style (fill, stroke, font) and apply to similar shapes
3. **Connectors:** Use "Straight" or "Elbowed" for clean layouts
4. **Alignment:** Use Arrange → Align / Distribute for consistency
5. **Export:** File → Export as → PNG/SVG for docs

---

## 5. File Locations

| File | Purpose |
| ---- | ------- |
| `docs/architecture/platform-mapping-and-diagrams.md` | Mermaid source (single source of truth) |
| `docs/architecture/diagrams/*.png` | Exported PNG (from `npm run diagrams:export`) |
| `docs/architecture/diagrams/*.svg` | Exported SVG (from `npm run diagrams:export`) |
| `docs/architecture/platform-architecture.drawio.png` | Platform architecture — Draw.io export (PNG) |
| `docs/architecture/platform-architecture.drawio.svg` | Platform architecture — Draw.io export (SVG) |
| `docs/architecture/*.drawio` | Draw.io native source files (optional, for editing) |

---

## 6. Mermaid vs Draw.io

| Use Mermaid when | Use Draw.io when |
| ---------------- | ---------------- |
| Diagrams live in markdown | Need pixel-perfect layout |
| Version control friendly | Collaborative editing |
| Quick iterations | Complex diagrams |
| CI/CD export | Handoff to designers |

Run `npm run diagrams:export` to generate PNG/SVG from the Mermaid source.
