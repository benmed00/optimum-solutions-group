# Optimum Solutions Group — Platform Mapping & UML Diagrams

Global mapping of the website/platform with class, component, sequence, activity, and use case diagrams.

---

## 1. Platform Overview

| Layer | Technologies |
| ----- | ------------ |
| Frontend | React 18, TypeScript, Vite 5 |
| Routing | react-router-dom 6 |
| State/Data | @tanstack/react-query |
| UI | Radix UI, shadcn, Tailwind CSS |
| Forms | react-hook-form, zod |
| PWA | Service Worker, manifest.json |
| Analytics | web-vitals, custom analytics |

### Routes

| Path | Component | Purpose |
| --- | --- | --- |
| `/` | Index | Landing page (Hero, About, Services, IoT, Portfolio, Testimonials, FAQ, Contact) |
| `/component-showcase` | ComponentShowcase | UI component gallery |
| `/analytics` | AnalyticsPage | Analytics dashboard |
| `/pwa` | PWAPage | PWA info & status |
| `*` | NotFound | 404 page |

---

## 2. Class Diagram

```mermaid
classDiagram
    class ApiError {
        +string message
        +number status
        +Response response
        +constructor(message, status?, response?)
    }

    class ApiClient {
        +get(url, config)
        +post(url, body?, config)
        +put(url, body?, config)
        +delete(url, config)
    }

    class EventBus {
        -Map~string,Set~listeners
        -EventBusEvent[] eventHistory
        +on(eventType, callback) EventUnsubscribe
        +once(eventType, callback) EventUnsubscribe
        +emit(eventType, data, source?)
        +off(eventType)
        +clear()
        +getHistory(eventType?) EventBusEvent[]
    }

    class EventBusEvent {
        +string type
        +T data
        +number timestamp
        +string source
    }

    class ErrorBoundary {
        -State state
        -retryTimeout
        +getDerivedStateFromError(error) State
        +componentDidCatch(error, errorInfo)
        +handleRetry()
        +render() ReactNode
    }

    class AccessibilityProvider {
        -prefersReducedMotion boolean
        +announceMessage(message)
        +useAccessibilityContext()
    }

    class PerformanceMonitor {
        -PerformanceMetrics metrics
        -UserInteractionMetrics userMetrics
        -PerformanceAlert[] alerts
        -Set observers
        +startMonitoring()
        +stopMonitoring()
        +getMetrics() PerformanceMetrics
        +getUserMetrics() UserInteractionMetrics
        +subscribe(observer) unsubscribe
        +sendToAnalytics(metrics)
    }

    class PerformanceMetrics {
        +cls WebVitalsMetric
        +fcp WebVitalsMetric
        +lcp WebVitalsMetric
        +ttfb WebVitalsMetric
        +performanceScore number
        +coreWebVitalsScore number
    }

    class ServiceWorkerManager {
        +register(path?)
        +unregister()
        +update()
    }

    ApiError --|> Error
    ApiClient ..> ApiError : throws
    ApiClient ..> apiRequest : uses
    EventBus --> EventBusEvent : creates
    PerformanceMonitor --> PerformanceMetrics : holds
    PerformanceMonitor ..> ApiClient : sendToAnalytics
```

---

## 3. Component Diagram

```mermaid
flowchart TB
    subgraph App["App (Root)"]
        EB[ErrorBoundary]
        AP[AccessibilityProvider]
        QC[QueryClientProvider]
        BR[BrowserRouter]
    end

    subgraph Pages["Pages"]
        Idx[Index]
        Ana[AnalyticsPage]
        CS[ComponentShowcase]
        PWA[PWAPage]
        NF[NotFound]
    end

    subgraph Features["Features"]
        Nav[Navigation]
        Hero[HeroSection]
        About[AboutSection]
        Svc[ServicesSection]
        IoT[IoTSection]
        Port[PortfolioSection]
        Test[TestimonialsSection]
        Cont[ContactSection]
    end

    subgraph Shared["Shared Components"]
        PE[ProjectEstimator]
        FAQ[FAQSection]
        PWAInst[PWAInstallPrompt]
        Foot[Footer]
        BTT[BackToTop]
        SEO[SEOHead]
    end

    subgraph Services["Services"]
        API[apiClient]
        EBus[eventBus]
        Perf[performanceMonitor]
    end

    EB --> AP --> QC --> BR
    BR --> Idx
    BR --> Ana
    BR --> CS
    BR --> PWA
    BR --> NF

    Idx --> Nav
    Idx --> Hero
    Idx --> About
    Idx --> Svc
    Idx --> IoT
    Idx --> PE
    Idx --> Port
    Idx --> Test
    Idx --> FAQ
    Idx --> Cont
    Idx --> Foot
    Idx --> BTT
    Idx --> PWAInst
    Idx --> SEO

    Cont -.->|submit| API
    Perf -.->|send metrics| API
```

---

## 4. Sequence Diagrams

### 4.1 Page Load & Initialization

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant App
    participant ErrorBoundary
    participant AccessibilityProvider
    participant QueryClient
    participant Router
    participant Index
    participant LoadingScreen
    participant Navigation
    participant HeroSection

    User->>Browser: Navigate to /
    Browser->>App: Mount React app
    App->>ErrorBoundary: Wrap children
    ErrorBoundary->>AccessibilityProvider: Wrap children
    AccessibilityProvider->>QueryClient: Wrap children
    QueryClient->>Router: Wrap children
    Router->>Index: Render Index (route /)
    Index->>LoadingScreen: Show while loading
    Index->>Index: usePageLoad()
    Index->>Index: useAnalytics()
    LoadingScreen-->>Index: Loading complete
    Index->>Navigation: Render
    Index->>HeroSection: Render
    Index->>Index: Lazy load ServicesSection, IoTSection, etc.
    Index-->>User: Display landing page
```

### 4.2 Contact Form Submission

```mermaid
sequenceDiagram
    participant User
    participant ContactSection
    participant useToast
    participant Toast

    User->>ContactSection: Fill form & submit
    ContactSection->>ContactSection: handleSubmit()
    ContactSection->>ContactSection: setIsSubmitting(true)
    ContactSection->>ContactSection: Simulate API (1s delay)
    ContactSection->>useToast: toast({ title, description })
    useToast->>Toast: Display success message
    ContactSection->>ContactSection: Reset form
    ContactSection->>ContactSection: setIsSubmitting(false)
    Toast-->>User: "Message Sent Successfully!"
```

### 4.3 Performance Metrics to Analytics

```mermaid
sequenceDiagram
    participant Page
    participant PerformanceMonitor
    participant ApiClient
    participant AnalyticsAPI

    Page->>PerformanceMonitor: DOMContentLoaded
    PerformanceMonitor->>PerformanceMonitor: startMonitoring()
    PerformanceMonitor->>PerformanceMonitor: initializeWebVitals()
    PerformanceMonitor->>PerformanceMonitor: initializeCustomMetrics()
    PerformanceMonitor->>PerformanceMonitor: initializeUserTracking()
    loop Every 5 min (production)
        PerformanceMonitor->>PerformanceMonitor: sendToAnalytics(metrics)
        PerformanceMonitor->>ApiClient: post('/api/analytics/performance', payload)
        ApiClient->>AnalyticsAPI: HTTP POST
        AnalyticsAPI-->>ApiClient: 200 OK
    end
```

---

## 5. Activity Diagram (Action Diagram)

### 5.1 User Navigation Flow

```mermaid
flowchart TD
    A[User visits site] --> B{Page load}
    B --> C[LoadingScreen]
    B --> D[Index / Landing]
    C --> D
    D --> E[Scroll / Navigate sections]
    E --> F{Action?}
    F -->|Click nav link| G[Scroll to #about, #services, #iot, etc.]
    F -->|Click /analytics| H[AnalyticsPage]
    F -->|Click /component-showcase| I[ComponentShowcase]
    F -->|Click /pwa| J[PWAPage]
    F -->|Submit contact form| K[ContactSection handleSubmit]
    F -->|Use Project Estimator| L[ProjectEstimator calculateEstimate]
    G --> E
    H --> E
    I --> E
    J --> E
    K --> M[Toast: Success]
    L --> N[Toast: Estimate]
    M --> E
    N --> E
```

### 5.2 Error Handling Flow

```mermaid
flowchart TD
    A[Component renders] --> B{Error?}
    B -->|No| C[Render children]
    B -->|Yes| D[ErrorBoundary catches]
    D --> E[getDerivedStateFromError]
    E --> F[componentDidCatch]
    F --> G{onError provided?}
    G -->|Yes| H[Call onError callback]
    G -->|No| I[Log to console]
    H --> J[Render fallback]
    I --> J
    J --> K{User clicks Retry?}
    K -->|Yes| L[handleRetry]
    L --> M[setState hasError: false]
    M --> A
    K -->|No| J
```

### 5.3 PWA Offline Flow

```mermaid
flowchart TD
    A[User navigates] --> B{Online?}
    B -->|Yes| C[Load from network]
    B -->|No| D[Service Worker intercepts]
    D --> E{Cached?}
    E -->|Yes| F[Return cached response]
    E -->|No| G[offline.html]
    G --> H[Show offline message]
    H --> I[Reconnect button]
    I --> J{Network restored?}
    J -->|Yes| K[Reload page]
    J -->|No| H
```

---

## 6. Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors
        Visitor[Visitor]
        User[User]
    end

    subgraph UseCases["Use Cases"]
        UC1[Browse landing page]
        UC2[Scroll to sections]
        UC3[Use Project Estimator]
        UC4[Submit contact form]
        UC5[View analytics dashboard]
        UC6[Install PWA]
        UC7[Use high-contrast mode]
        UC8[View component showcase]
        UC9[Read PWA info]
        UC10[Handle offline mode]
    end

    Visitor --> UC1
    Visitor --> UC2
    Visitor --> UC3
    Visitor --> UC4
    Visitor --> UC5
    Visitor --> UC6
    Visitor --> UC7
    Visitor --> UC8
    Visitor --> UC9
    Visitor --> UC10
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
```

### Use Case Descriptions

| Use Case | Actor | Description |
| --- | --- | --- |
| Browse landing page | Visitor, User | View Hero, About, Services, IoT, Portfolio, Testimonials, FAQ, Contact |
| Scroll to sections | Visitor, User | Use navigation links to jump to #about, #services, #iot, #portfolio, #faq, #contact |
| Use Project Estimator | Visitor, User | Select project type, design, environment, features; get price estimate; submit for consultation |
| Submit contact form | Visitor, User | Fill name, email, company, project type, message; submit; receive toast confirmation |
| View analytics dashboard | Visitor, User | Navigate to /analytics; view page views, events, Core Web Vitals |
| Install PWA | Visitor, User | Accept PWA install prompt; add to home screen |
| Use high-contrast mode | Visitor, User | Toggle high-contrast for accessibility |
| View component showcase | Visitor, User | Navigate to /component-showcase; browse UI components |
| Read PWA info | Visitor, User | Navigate to /pwa; view PWA status and capabilities |
| Handle offline mode | Visitor, User | When offline, see offline.html with reconnect option |

---

## 7. State Diagram

### 7.1 ErrorBoundary State

```mermaid
stateDiagram-v2
    [*] --> Ready: Mount
    Ready --> Error: Component throws
    Error --> Ready: User clicks Retry
    Error --> Error: Stay on fallback
    Ready --> [*]: Unmount
```

### 7.2 PWA Install Prompt State

```mermaid
stateDiagram-v2
    [*] --> Hidden: Page load
    Hidden --> Visible: Delay elapsed & not installed
    Visible --> Dismissed: User dismisses
    Visible --> Installed: User installs
    Dismissed --> [*]
    Installed --> [*]
```

### 7.3 Contact Form State

```mermaid
stateDiagram-v2
    [*] --> Idle: Mount
    Idle --> Editing: User types
    Editing --> Idle: Clear/Cancel
    Idle --> Submitting: Submit click
    Submitting --> Success: API success
    Submitting --> Error: API failure
    Success --> Idle: Reset form
    Error --> Idle: User retries
```

---

## 8. Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Post : "authors"
    User {
        int id PK
        string email
        string firstName
        string lastName
        string role
        datetime createdAt
        datetime updatedAt
    }

    Contact ||--o| User : "optional"
    Contact {
        uuid id PK
        string name
        string email
        string company
        string phone
        string projectType
        string message
        string timeline
        datetime createdAt
    }

    AnalyticsEvent {
        string id PK
        string type
        string category
        string action
        string sessionId
        string url
        int timestamp
        object properties
    }

    AnalyticsSession {
        string id PK
        int startTime
        int pageViews
        int interactions
        int duration
    }

    Post {
        int id PK
        string title
        string slug
        string content
        string status
        int authorId FK
        datetime publishedAt
        datetime createdAt
    }

    PerformanceMetrics {
        object metrics
        string userAgent
        string url
        int timestamp
    }

    AnalyticsEvent }o--|| AnalyticsSession : "belongs to"
    PerformanceMetrics }o--|| AnalyticsSession : "associated"
```

---

## 9. Deployment Diagram

```mermaid
flowchart TB
    subgraph Dev["Development"]
        DevLocal[localhost:8080]
        Vite[Vite Dev Server]
        HMR[HMR]
        DevLocal --> Vite
        Vite --> HMR
    end

    subgraph Build["Build Pipeline"]
        NPM[npm run build]
        ViteBuild[Vite Build]
        Rollup[Rollup Bundling]
        Output[dist/]
        NPM --> ViteBuild
        ViteBuild --> Rollup
        Rollup --> Output
    end

    subgraph Hosting["Production Hosting"]
        CDN[CDN / Edge]
        Static[Static Files]
        SW[Service Worker]
        Manifest[manifest.json]
        Output --> Static
        Static --> CDN
        SW --> CDN
        Manifest --> CDN
    end

    subgraph API["Backend API"]
        APIProd[api.optimumsolutions.com]
        APIStaging[api.staging.optimumsolutions.com]
    end

    subgraph Client["Client Browser"]
        Browser[Browser]
        PWA[PWA Cache]
        Browser --> CDN
        Browser --> APIProd
        PWA --> Browser
    end

    Build --> Hosting
```

---

## 10. C4 Model Diagrams

### 10.1 C4 Level 1 — System Context

```mermaid
flowchart TB
    subgraph External["External Systems"]
        Visitor[Visitor]
        User[User]
    end

    subgraph System["Optimum Solutions Group"]
        WebApp[Web Application]
    end

    subgraph ExternalSystems["External Systems"]
        API[Optimum API]
        GA[Google Analytics]
    end

    Visitor -->|Browse, Contact| WebApp
    User -->|Browse, Analytics, PWA| WebApp
    WebApp -->|REST, Auth| API
    WebApp -.->|Events, Web Vitals| GA
```

### 10.2 C4 Level 2 — Container

```mermaid
flowchart TB
    subgraph WebApp["Web Application"]
        SPA[React SPA]
        SW[Service Worker]
    end

    subgraph External["External"]
        Visitor[Visitor]
        API[Backend API]
    end

    Visitor -->|HTTPS| SPA
    SPA -->|Fetch, XHR| API
    SW -->|Cache, Offline| SPA
```

### 10.3 C4 Level 3 — Component (Landing Page)

```mermaid
flowchart TB
    subgraph IndexPage["Index Page"]
        Nav[Navigation]
        Hero[HeroSection]
        About[AboutSection]
        Services[ServicesSection]
        IoT[IoTSection]
        Estimator[ProjectEstimator]
        Portfolio[PortfolioSection]
        Testimonials[TestimonialsSection]
        FAQ[FAQSection]
        Contact[ContactSection]
        Footer[Footer]
    end

    subgraph Shared["Shared"]
        SEO[SEOHead]
        PWAInst[PWAInstallPrompt]
        Analytics[useAnalytics]
    end

    Nav --> Hero
    Hero --> About
    About --> Services
    Services --> IoT
    IoT --> Estimator
    Estimator --> Portfolio
    Portfolio --> Testimonials
    Testimonials --> FAQ
    FAQ --> Contact
    Contact --> Footer
    SEO --> Nav
    Analytics --> Hero
    PWAInst --> Hero
```

---

## 11. Export & Draw.io

### Export to PNG/SVG

Run `npm run diagrams:export` to generate PNG and SVG files from all Mermaid diagrams. Output: `docs/architecture/diagrams/`.

Requires: `@mermaid-js/mermaid-cli` (installed with `--legacy-peer-deps` due to puppeteer version).

### Draw.io Structure

See [Draw.io Structure Guide](../guides/drawio-structure-guide.md) for how to recreate these diagrams in Draw.io (diagrams.net).

---

## 12. Key Files Reference

| Category | Path |
| -------- | ---- |
| App entry | `src/App.tsx`, `src/main.tsx` |
| Pages | `src/pages/Index.tsx`, `AnalyticsPage.tsx`, `ComponentShowcase.tsx`, `PWAPage.tsx`, `NotFound.tsx` |
| Features | `src/features/navigation`, `hero`, `about`, `services`, `iot-solutions`, `portfolio`, `testimonials`, `contact` |
| Services | `src/shared/services/apiClient.ts`, `eventBus.ts` |
| Utils | `src/shared/utils/performanceMonitor.ts`, `errorHandler.ts`, `serviceWorkerManager.ts` |
| Shared components | `src/shared/components/ErrorBoundary.tsx`, `AccessibilityProvider.tsx`, `ProjectEstimator.tsx`, `ContactSection` (feature) |
| API | `docs/api/openapi.yaml` |
