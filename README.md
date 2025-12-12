# J&J Organizational Chart Web Application

A full-stack web application that displays an organizational chart from a list of people

![J&J OrgChart](https://img.shields.io/badge/J%26J-OrgChart-EB1700?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)

## 🔗 Links

- **Deployed Application:** [https://jnj-orgchart.vercel.app](https://jnj-orgchart.vercel.app) *(Frontend - Deploy pending)*
- **API Documentation (Swagger):** [https://jnj-orgchart-production.up.railway.app/docs](https://jnj-orgchart-production.up.railway.app/docs)
- **API Health Check:** [https://jnj-orgchart-production.up.railway.app/health](https://jnj-orgchart-production.up.railway.app/health)
- **Source Code:** [GitHub Repository](https://github.com/renatormsilva/jnj-orgchart)

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

- ✅ **List/Table View** - Paginated, sortable table with all people
- ✅ **Hierarchy View** - Interactive organizational tree with zoom/pan
- ✅ **Person Details** - Name, job title, department, manager, direct reports, photo, type, status
- ✅ **Search** - Real-time search across names
- ✅ **Filters** - Department, Manager, Type (Employee/Partner), Status (Active/Inactive)
- ✅ **CEO Highlight** - Crown icon for top of hierarchy
- ✅ **J&J Brand Colors** - Primary Red (#EB1700), White, Grays, Black text
- ✅ **J&J Brand Typography** - Arial as default font per brand guidelines (Johnson Display/Text would be used in production via J&J Brand Center)

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

## 🌟 Plus Features Implemented

### 1. ✅ Database Management
- PostgreSQL with Prisma ORM
- Schema migrations and versioning
- Seed data with 100 people from `org-chart-people-100.json`
- Indexes for performance optimization

### 2. ✅ Logging Management
- Pino structured JSON logging
- Log levels: debug, info, warn, error
- Request/response logging with duration
- Request ID tracking

### 3. ✅ API Documentation
- Swagger/OpenAPI 3.0 specification
- Interactive documentation at `/docs`
- Try-it-out functionality

### 4. ✅ Health Check Endpoints
- `GET /health` - Basic status
- `GET /health/ready` - Database connection check
- `GET /health/live` - Kubernetes liveness probe 

### 5. ✅ API Best Practices
- Request validation with Zod
- Proper HTTP status codes (200, 201, 400, 404, 500)
- Structured error responses with request ID
- Pagination with hasNext/hasPrevious

### 6. ✅ Security & Performance
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection (Helmet)
- CORS configuration
- Environment variables for sensitive data

### 7. ✅ Docker Containerization
- Multi-stage Dockerfile for backend
- Docker Compose for local development
- Production-optimized builds

### 8. ✅ Code Quality Tools
- ESLint + Prettier for consistent code
- TypeScript strict mode
- Husky pre-commit hooks (optional)

### 9. ✅ Analytics Integration
- Google Analytics 4 integration
- Page view tracking
- Custom event tracking (person selected, filters applied, zoom actions)

### 10. ✅ Authentication
- API Key authentication for write operations
- X-API-Key header validation
- Configurable via environment variables

### 11. ✅ Event Management
- Event-driven architecture for tracking system events
- Events logged: `person.created`, `person.updated`, `person.deleted`, `person.manager_changed`, `person.status_changed`
- Full event history stored in database (EventLog table)
- API endpoints to query events:
  - `GET /api/v1/events` - List all events (paginated, filterable)
  - `GET /api/v1/events/:id` - Get event by ID
  - `GET /api/v1/events/aggregate/:type/:id` - Get events for specific entity
  - `GET /api/v1/events/statistics` - Event statistics
- Pub/sub pattern for real-time event notifications

### 12. ✅ Automated Tests
- **Unit Tests:** 138 tests (72 backend + 66 frontend)
- **E2E Tests:** Playwright tests for UI flows and API

### 13. ✅ CI/CD Pipeline
- **GitHub Actions** workflow for automated testing
- Runs on every push and pull request
- Jobs: Lint, Build, Unit Tests, E2E Tests
- Parallel execution for faster feedback
- PostgreSQL service container for E2E tests

---

## 📖 API Documentation

### Swagger UI

Access the interactive API documentation at:
- Local: http://localhost:3000/docs
- Production: https://your-api-url/docs

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

| Layer | Tests | Coverage |
|-------|-------|----------|
| Backend Unit | 72 | Services (PersonService, EventService), Helpers, Errors |
| Frontend Unit | 66 | Hooks, Store, Utils, Components |
| E2E | 32 | Home, People List, Hierarchy, API |

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
   - Changes require page refresh
   - Future: WebSocket integration for live updates

2. **Basic Authentication**
   - API key authentication only
   - Future: JWT with user roles and permissions

3. **No Rate Limiting**
   - API is unprotected against abuse
   - Future: Implement rate limiting middleware

4. **Limited Mobile Optimization**
   - Hierarchy view challenging on small screens
   - Future: Responsive hierarchy with collapsible branches

5. **No Offline Support**
   - Requires internet connection
   - Future: Service Worker for offline capability

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
