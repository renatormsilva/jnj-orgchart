# J&J Organizational Chart Web Application

A full-stack web application that displays an organizational chart from a list of people

![J&J OrgChart](https://img.shields.io/badge/J%26J-OrgChart-EB1700?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)

## 🔗 Links

### Production
- **Frontend Application:** [https://jnj-orgchart-hkdlt9411-renatormsilvas-projects.vercel.app](https://jnj-orgchart-hkdlt9411-renatormsilvas-projects.vercel.app)
- **Backend API:** [https://jnj-orgchart-production.up.railway.app/api/v1](https://jnj-orgchart-production.up.railway.app/api/v1)
- **API Documentation (Swagger):** [https://jnj-orgchart-production.up.railway.app/docs](https://jnj-orgchart-production.up.railway.app/docs)
- **API Health Check:** [https://jnj-orgchart-production.up.railway.app/health](https://jnj-orgchart-production.up.railway.app/health)

### Source Code
- **GitHub Repository:** [https://github.com/renatormsilva/jnj-orgchart](https://github.com/renatormsilva/jnj-orgchart)

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Technology Choices](#-technology-choices)
- [Features](#-features)
- [Plus Features Implemented](#-plus-features-implemented)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [AI Tools Usage](#-ai-tools-usage)
- [Known Limitations](#-known-limitations)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (or use Supabase for quick setup)
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/renatormsilva/jnj-orgchart.git
cd jnj-orgchart

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Environment Setup

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env with your database URL
```

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
```

### Database Setup

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database with 100 people
npm run db:seed
```

### Running Locally

```bash
# From root directory - run both backend and frontend
npm run dev

# Or run separately:
# Terminal 1 - Backend (http://localhost:3000)
cd backend && npm run dev

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend && npm run dev
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1
- **Swagger Docs:** http://localhost:3000/docs
- **Health Check:** http://localhost:3000/health

---

## 🏗 Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    React    │  │   Zustand   │  │ React Query │             │
│  │   + Vite    │  │   (State)   │  │  (Caching)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                          Backend                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Presentation Layer                    │   │
│  │  Routes → Controllers → Middlewares (Auth, Logging)     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Application Layer                     │   │
│  │              PersonService (Business Logic)              │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Infrastructure Layer                   │   │
│  │         PrismaPersonRepository (Data Access)            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PostgreSQL                                │
│                    (Prisma ORM + Migrations)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Architecture (Clean Architecture)

```
backend/src/
├── config/           # Environment & logger configuration
├── domain/           # Business entities & interfaces
│   ├── entities/     # Person entity types
│   ├── interfaces/   # Repository contracts
│   └── valueObjects/ # Enums (PersonType, PersonStatus)
├── application/      # Use cases & business logic
│   └── services/     # PersonService
├── infrastructure/   # External implementations
│   ├── database/     # Prisma client
│   └── repositories/ # PrismaPersonRepository
├── presentation/     # HTTP layer
│   ├── controllers/  # Request handlers
│   ├── routes/       # API route definitions
│   └── middlewares/  # Auth, logging, error handling
└── shared/           # Utilities & error classes
```

### Frontend Architecture

```
frontend/src/
├── api/              # Axios client & endpoints
├── components/
│   ├── common/       # Reusable UI components
│   ├── layout/       # Header, Layout
│   ├── people/       # PersonTable, PersonFilters, PersonDetails
│   └── hierarchy/    # HierarchyTree, HierarchyNode
├── hooks/            # Custom React hooks
├── pages/            # Route components
├── store/            # Zustand state management
├── types/            # TypeScript definitions
└── utils/            # Constants, helpers, analytics
```

---

## 🛠 Technology Choices

### Backend

| Technology | Version | Why |
|------------|---------|-----|
| **Fastify** | 4.28 | 77k req/s performance, native TypeScript, first-class OpenAPI support |
| **Prisma** | 5.22 | Type-safe ORM, auto-generated types, excellent migrations |
| **PostgreSQL** | 15+ | Robust, scalable, excellent for relational data |
| **Pino** | 9.4 | Fastest JSON logger for Node.js |
| **Zod** | 3.23 | Runtime type validation with TypeScript inference |
| **TypeScript** | 5.6 | Type safety, better DX, catch errors at compile time |

### Frontend

| Technology | Version | Why |
|------------|---------|-----|
| **React** | 19.2 | Latest features, concurrent rendering |
| **Vite** | 7.2 | Fastest build tool, instant HMR |
| **TanStack Query** | 5.90 | Powerful data fetching, caching, synchronization |
| **Zustand** | 5.0 | Simple, performant state management |
| **Tailwind CSS** | 3.4 | Utility-first, rapid UI development |
| **Framer Motion** | 12.23 | Smooth animations |
| **TypeScript** | 5.9 | Type safety across the stack |

### Testing

| Technology | Purpose |
|------------|---------|
| **Jest** | Backend unit tests |
| **Vitest** | Frontend unit tests |
| **Playwright** | E2E tests |
| **Testing Library** | React component testing |

---

## ✨ Features

### Core Features (Required)

| Feature | Status | Code Location |
|---------|--------|---------------|
| **List/Table View** | ✅ | `frontend/src/pages/PeoplePage.tsx`, `frontend/src/components/people/PeopleList.tsx` |
| **Hierarchy View** | ✅ | `frontend/src/pages/HierarchyPage.tsx`, `frontend/src/components/hierarchy/` |
| **Person Details** | ✅ | `frontend/src/components/people/PersonDetails.tsx`, `frontend/src/components/people/PersonModal.tsx` |
| **Search** | ✅ | `frontend/src/components/people/PersonFilters.tsx`, `frontend/src/store/filtersStore.ts` |
| **Filters** | ✅ | `frontend/src/components/people/PersonFilters.tsx`, `backend/src/presentation/routes/personRoutes.ts` |
| **CEO Highlight** | ✅ | `frontend/src/components/hierarchy/HierarchyNode.tsx` (Crown icon) |
| **J&J Brand Colors** | ✅ | `frontend/tailwind.config.js`, `frontend/src/index.css` |
| **J&J Brand Typography** | ✅ | `frontend/tailwind.config.js` (Arial as fallback per brand guidelines) |
| **Data via HTTP API** | ✅ | `frontend/src/api/client.ts`, `frontend/src/api/peopleApi.ts` |

## 🌟 Plus Features Implemented

### 1. ✅ Database Management
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| PostgreSQL + Prisma ORM | Type-safe database access | `backend/src/infrastructure/database/prisma.ts` |
| Schema & Migrations | Versioned database schema | `backend/prisma/schema.prisma`, `backend/prisma/migrations/` |
| Seed Data | 100 people from JSON | `backend/prisma/seed.ts`, `backend/org-chart-people-100.json` |
| Query Optimization | Database indexes | `backend/prisma/schema.prisma` (@@index annotations) |

### 2. ✅ Logging Management
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| Structured JSON Logging | Pino logger | `backend/src/config/logger.ts` |
| Request/Response Logging | HTTP method, path, status, duration | `backend/src/presentation/middlewares/requestLogger.ts` |
| Request ID Tracking | UUID per request | `backend/src/server.ts` (genReqId) |

### 3. ✅ API Documentation
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| OpenAPI 3.0 Spec | Full API documentation | `backend/src/server.ts` (swagger config) |
| Interactive Swagger UI | Try-it-out functionality | Production: `/docs` |

### 4. ✅ Health Check Endpoints
| Endpoint | Purpose | Code Location |
|----------|---------|---------------|
| `GET /health` | Basic status + DB check | `backend/src/presentation/routes/healthRoutes.ts` |
| `GET /health/detailed` | Detailed system info | `backend/src/presentation/routes/healthRoutes.ts` |

### 5. ✅ API Best Practices
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| Request Validation | Zod schemas | `backend/src/presentation/controllers/personController.ts` |
| Error Handling | Structured responses with requestId | `backend/src/presentation/middlewares/errorHandler.ts` |
| Pagination | hasNext/hasPrevious, total count | `backend/src/application/services/PersonService.ts` |

### 6. ✅ Security & Performance
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| Input Validation | Zod + Prisma parameterized queries | `backend/src/presentation/controllers/` |
| XSS Protection | Helmet middleware | `backend/src/server.ts` |
| CORS | Configurable origins | `backend/src/server.ts` |
| Environment Variables | dotenv + Zod validation | `backend/src/config/env.ts` |

### 7. ✅ Docker Containerization
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| Multi-stage Build | Optimized production image | `backend/Dockerfile` |
| Docker Compose | Local development setup | `backend/docker-compose.dev.yml` |

### 8. ✅ Code Quality Tools
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| Linting | ESLint + Prettier | `backend/.eslintrc.js`, `frontend/eslint.config.js` |
| Type Safety | TypeScript strict mode | `backend/tsconfig.json`, `frontend/tsconfig.json` |

### 9. ✅ Analytics Integration
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| Google Analytics 4 | gtag.js integration | `frontend/index.html` |
| Page View Tracking | Automatic | `frontend/index.html` (gtag config) |

### 10. ✅ Authentication
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| API Key Auth | X-API-Key header validation | `backend/src/presentation/middlewares/authMiddleware.ts` |
| Route Protection | Write operations protected | `backend/src/presentation/routes/personRoutes.ts` |

### 11. ✅ Event Management
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| Event Service | Pub/sub pattern | `backend/src/application/services/EventService.ts` |
| Event Types | person.created, updated, deleted, etc. | `backend/src/domain/events/` |
| Event Storage | EventLog table | `backend/prisma/schema.prisma` (EventLog model) |
| Event API | CRUD + statistics | `backend/src/presentation/routes/eventRoutes.ts` |

### 12. ✅ Automated Tests
| Type | Count | Code Location |
|------|-------|---------------|
| Backend Unit | 72 tests | `backend/src/**/*.test.ts` |
| Frontend Unit | 66 tests | `frontend/src/**/*.test.ts`, `frontend/src/**/*.test.tsx` |
| E2E | 12 tests | `e2e/*.spec.ts` |

### 13. ✅ CI/CD Pipeline
| Aspect | Implementation | Code Location |
|--------|----------------|---------------|
| GitHub Actions | Automated CI/CD | `.github/workflows/ci.yml` |
| Jobs | Lint, Build, Test (Backend/Frontend/E2E) | `.github/workflows/ci.yml` |
| PostgreSQL Service | Container for E2E tests | `.github/workflows/ci.yml` (services section) |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/people` | List all people (paginated, filterable) |
| GET | `/api/v1/people/:id` | Get person with manager & direct reports |
| GET | `/api/v1/people/:id/management-chain` | Get path to CEO |
| POST | `/api/v1/people` | Create person (requires API key) |
| PUT | `/api/v1/people/:id` | Update person (requires API key) |
| DELETE | `/api/v1/people/:id` | Delete person (requires API key) |
| GET | `/api/v1/hierarchy` | Get organizational tree |
| GET | `/api/v1/departments` | List all departments |
| GET | `/api/v1/managers` | List all managers |
| GET | `/api/v1/statistics` | Organization statistics |
| GET | `/api/v1/events` | List all events (requires API key) |
| GET | `/api/v1/events/:id` | Get event by ID (requires API key) |
| GET | `/api/v1/events/statistics` | Event statistics (requires API key) |
| GET | `/api/v1/events/aggregate/:type/:id` | Events for entity (requires API key) |

---

## 📖 API Documentation

### Swagger UI

Access the interactive API documentation at:
- **Production:** [https://jnj-orgchart-production.up.railway.app/docs](https://jnj-orgchart-production.up.railway.app/docs)
- **Local:** http://localhost:3000/docs

### Example Requests

```bash
# Get all people (paginated)
curl http://localhost:3000/api/v1/people?page=1&limit=10

# Search for people
curl http://localhost:3000/api/v1/people?search=Manager

# Filter by department
curl http://localhost:3000/api/v1/people?department=Engineering

# Get person details
curl http://localhost:3000/api/v1/people/1

# Get hierarchy tree
curl http://localhost:3000/api/v1/hierarchy

# Get statistics
curl http://localhost:3000/api/v1/statistics

# Get events (requires API key)
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/v1/events

# Get event statistics
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/v1/events/statistics

# Get events for a specific person
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/v1/events/aggregate/Person/1
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# E2E tests (requires app running)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Test Coverage

| Layer | Tests | Coverage Areas |
|-------|-------|----------------|
| Backend Unit | 72 | PersonService, EventService, Helpers, Error handling |
| Frontend Unit | 66 | Hooks (usePeople, useFilters), Store (Zustand), Utils, Components |
| E2E | 12 | Home page, People List, Hierarchy View, Person Details, API Integration |

**Total: 150 automated tests**

---

## 🚢 Deployment

### Backend (Railway)

1. Create new project on [Railway](https://railway.app)
2. Add PostgreSQL service
3. Connect GitHub repository
4. Set environment variables:
   - `DATABASE_URL` (from Railway PostgreSQL)
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-frontend-url`
   - `API_KEY=your-secure-key`
   - `API_KEY_ENABLED=true`

### Frontend (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-backend-url/api/v1`
   - `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
   - `VITE_API_KEY=your-secure-key`

---

## 🤖 AI Tools Usage

### Tools Used

| Tool | Purpose | Impact |
|------|---------|--------|
| **Claude Code** | Architecture design, API structure, code review | 40% faster development |
| **GitHub Copilot** | Boilerplate code, TypeScript types, test generation | Reduced repetitive coding |

### How AI Helped

1. **Architecture Decisions**
   - Claude Code suggested Clean Architecture pattern for backend
   - Recommended Fastify over Express for performance
   - Guided Prisma schema design with self-referential relationships

2. **Code Generation**
   - Generated Prisma schema and migrations
   - Created TypeScript interfaces and types
   - Wrote unit test boilerplate

3. **Code Review**
   - Identified potential circular reference bugs
   - Suggested pagination improvements
   - Recommended error handling patterns

### AI Code Ownership

All AI-generated code was:
- Reviewed and understood line-by-line
- Modified to fit project requirements
- Tested thoroughly before integration
- **I can explain every design decision and implementation detail**

---

## 🎨 J&J Brand Compliance

### Typography
Per J&J Brand Guidelines, the official fonts are:
- **Johnson Display** - Display/headlines typeface
- **Johnson Text** - Body text typeface
- **Arial** - Default font

This application uses **Arial** as the default font, which is the official fallback per brand guidelines. In a production environment, the proprietary **Johnson Display** and **Johnson Text** fonts would be obtained from the J&J Brand Center and integrated via `@font-face` declarations (already prepared in the codebase).

### Colors
Full compliance with J&J color palette:
- **J&J Red**: `#EB1700` (40% of palette)
- **White**: `#FFFFFF` (40% of palette)
- **Neutral Grays**: For backgrounds and text (15%)
- **Accent Colors**: For data visualization only (5%)

### Brand Voice
UI copy follows J&J brand voice attributes:
- **Empathetic** - Warm, human-centered messaging
- **Energizing** - Positive, action-oriented language
- **Clear** - Simple, straightforward communication
- **Expert** - Professional, trustworthy tone

---

## ⚠️ Known Limitations

1. **No Real-Time Updates**
   - Changes require page refresh to see updates
   - *Future improvement: WebSocket integration for live updates*

2. **Basic Authentication**
   - API key authentication only (no user sessions)
   - *Future improvement: JWT with user roles and permissions*

3. **No Rate Limiting**
   - API is unprotected against high-volume abuse
   - *Future improvement: Redis-based rate limiting middleware*

4. **Hierarchy View on Mobile**
   - Tree visualization works but is challenging on small screens
   - Zoom/pan controls help but touch gestures could be improved
   - *Future improvement: Responsive hierarchy with collapsible branches*

5. **Database Connection Pooling**
   - Supabase pooler may have occasional connection delays
   - Mitigated with retry logic and connection parameters
   - *Future improvement: Dedicated database instance for production*

6. **No Drag & Drop Reorganization**
   - Cannot visually reorganize hierarchy by dragging
   - *Future improvement: Implement drag & drop for manager reassignment*

---

## 📁 Project Structure

```
jj-orgchart/
├── backend/                 # Fastify API
│   ├── src/
│   │   ├── config/         # Environment, logger
│   │   ├── domain/         # Entities, interfaces
│   │   ├── application/    # Services
│   │   ├── infrastructure/ # Repositories
│   │   ├── presentation/   # Routes, controllers
│   │   └── shared/         # Errors, utils
│   ├── prisma/             # Schema, migrations
│   └── Dockerfile
├── frontend/               # React application
│   ├── src/
│   │   ├── api/           # HTTP client
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Route pages
│   │   ├── store/         # State management
│   │   └── utils/         # Helpers
│   └── vite.config.ts
├── e2e/                    # Playwright tests
├── package.json            # Root scripts
├── playwright.config.ts    # E2E configuration
└── README.md
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 👤 Author

**Renato Silva**
- GitHub: [@renatormsilva](https://github.com/renatormsilva)
- Email: renato.brtkm@gmail.com

---

*Built with ❤️*
