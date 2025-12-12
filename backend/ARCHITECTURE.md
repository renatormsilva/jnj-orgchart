# Arquitetura do Backend - J&J OrgChart API

## Análise de Requisitos vs Implementação

### Requisitos Obrigatórios (Core Requirements)

| Requisito | Status | Onde está implementado |
|-----------|--------|------------------------|
| API HTTP para dados | ✅ | `GET /api/v1/people`, `GET /api/v1/hierarchy` |
| Campos obrigatórios (id, name, jobTitle, department, managerId, photoPath, type, status) | ✅ | `prisma/schema.prisma` |
| Busca (search) | ✅ | `PersonService.getAll()` - busca em name, jobTitle, email |
| Filtro por Department | ✅ | Query param `?department=Executive` |
| Filtro por Manager | ✅ | Query param `?managerId=1` ou `?managerId=null` |
| Filtro por Type | ✅ | Query param `?type=Employee` ou `?type=Partner` |
| Filtro por Status | ✅ | Query param `?status=Active` ou `?status=Inactive` |
| Detalhes com Manager e Direct Reports | ✅ | `GET /api/v1/people/:id` |
| Hierarquia completa | ✅ | `GET /api/v1/hierarchy` retorna árvore |
| Topo da hierarquia | ✅ | Pessoa com `managerId: null` é a raiz |

### Plus Features (Diferenciais Valorizados)

| Feature | Status | Implementação |
|---------|--------|---------------|
| **Database Management** | ✅ | PostgreSQL + Prisma ORM |
| **Logging Management** | ✅ | Pino (structured JSON logs) |
| **API Documentation** | ✅ | Swagger/OpenAPI em `/docs` |
| **Health Check** | ✅ | `/health`, `/health/ready`, `/health/live` |
| **Request Validation** | ✅ | Validação de tipos no controller |
| **Error Handling** | ✅ | HTTP status codes corretos (200, 201, 400, 404, 500) |
| **Environment Variables** | ✅ | `.env` para DATABASE_URL, PORT, etc |
| **Docker** | ✅ | `Dockerfile` + `docker-compose.yml` |
| **Code Quality** | ✅ | ESLint + Prettier + TypeScript strict |
| **SQL Injection Prevention** | ✅ | Prisma ORM com queries parametrizadas |
| Event Management | ❌ | Removido para simplificar |
| Caching | ❌ | Não implementado (desnecessário para 100 pessoas) |
| CI/CD | ⏳ | Pode adicionar GitHub Actions |

---

## Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │ Controllers │  │     Middlewares         │  │
│  │  (Swagger)  │  │   (HTTP)    │  │ (Error, Logger, CORS)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    PersonService                         │    │
│  │  • getAll()      • create()     • getStatistics()       │    │
│  │  • getById()     • update()     • getDepartments()      │    │
│  │  • getHierarchy() • delete()    • getManagers()         │    │
│  │  • getManagementChain()                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DOMAIN                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐      │
│  │  Entities   │  │Value Objects│  │    Interfaces       │      │
│  │ PersonProps │  │ PersonType  │  │ IPersonRepository   │      │
│  │             │  │PersonStatus │  │                     │      │
│  └─────────────┘  └─────────────┘  └─────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                              │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐   │
│  │  PrismaPersonRepository │  │      Database (Prisma)      │   │
│  │   (implementa interface)│  │        PostgreSQL           │   │
│  └─────────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tecnologias e Justificativas Detalhadas

### Fastify (Framework HTTP)

| Aspecto | Fastify | Express |
|---------|---------|---------|
| Performance | **~77,000 req/s** | ~15,000 req/s |
| TypeScript | Nativo, tipos incluídos | Precisa @types/express |
| Validação | Schema-based nativo | Precisa middleware extra |
| Swagger | Plugin oficial integrado | Precisa swagger-ui-express |

**Por que escolhi Fastify?**
> "Fastify é 2-5x mais rápido que Express nos benchmarks oficiais. Para uma aplicação nova em 2024, não faz sentido usar Express quando Fastify oferece melhor performance, TypeScript nativo e plugins oficiais para Swagger. A API de plugins é mais limpa e o schema validation é integrado."

**Referências:**
- [Fastify Benchmarks](https://www.fastify.io/benchmarks/)
- [Fastify vs Express](https://blog.logrocket.com/comparing-fastify-express/)

---

### Prisma (ORM)

| Aspecto | Prisma | TypeORM | Sequelize |
|---------|--------|---------|-----------|
| Type Safety | **100% automático** | Manual com decorators | Parcial |
| Migrations | CLI simples | Complexo | Complexo |
| Query Builder | Intuitivo | Verbose | Callback-based |
| Learning Curve | Baixa | Alta | Média |

**Por que escolhi Prisma?**
> "Prisma gera tipos TypeScript automaticamente a partir do schema. Quando defino um model `Person`, automaticamente tenho `Prisma.PersonWhereInput`, `Prisma.PersonCreateInput`, etc. Isso elimina bugs de tipo em runtime. Além disso, as migrations são simples: `prisma migrate dev` e pronto."

**Exemplo de type-safety:**
```typescript
// Prisma gera isso automaticamente:
const person = await prisma.person.findUnique({
  where: { id: 1 },  // TypeScript sabe que 'id' é number
  include: { manager: true }  // TypeScript sabe que 'manager' existe
});
// person.name é string, person.managerId é number | null
```

---

### PostgreSQL (Banco de Dados)

| Aspecto | PostgreSQL | MySQL | SQLite |
|---------|------------|-------|--------|
| JSON Support | **Excelente (JSONB)** | Básico | Básico |
| Hierarquias | Recursive CTEs | Limitado | Limitado |
| Produção | **Heroku, Railway, Supabase** | Menos opções grátis | Não recomendado |
| Concorrência | MVCC avançado | Locking | Limitado |

**Por que escolhi PostgreSQL?**
> "PostgreSQL é o banco mais robusto para produção gratuita. Supabase, Railway, Neon oferecem PostgreSQL grátis. Além disso, suporta queries recursivas (WITH RECURSIVE) que seriam úteis para hierarquias muito profundas, e JSONB para dados flexíveis se precisar no futuro."

---

### Pino (Logger)

| Aspecto | Pino | Winston | Morgan |
|---------|------|---------|--------|
| Performance | **30x mais rápido** | Lento | Só HTTP |
| JSON Logs | Nativo | Config extra | Não |
| Integração Fastify | Plugin oficial | Manual | Manual |

**Por que escolhi Pino?**
> "Pino é o logger mais rápido do ecossistema Node.js. É 30x mais rápido que Winston porque serializa JSON de forma otimizada e usa workers para I/O assíncrono. Para produção, logs estruturados em JSON são essenciais para ferramentas como Datadog, CloudWatch ou ELK Stack."

**Exemplo de log estruturado:**
```json
{
  "level": 30,
  "time": 1702234567890,
  "pid": 12345,
  "hostname": "server-1",
  "reqId": "abc-123",
  "req": {
    "method": "GET",
    "url": "/api/v1/people"
  },
  "res": {
    "statusCode": 200
  },
  "responseTime": 45,
  "msg": "request completed"
}
```

---

## Fluxo de uma Requisição (Detalhado)

```
1. Cliente faz GET /api/v1/people?department=IT&page=1&limit=10

2. [Fastify] Recebe a requisição
   ├── CORS middleware verifica origem
   ├── Request Logger registra início
   └── Route matcher encontra handler

3. [PersonController.getAll()]
   ├── Parseia query string
   ├── Valida tipos (page é número?)
   └── Chama PersonService

4. [PersonService.getAll()]
   ├── Monta objeto de filtros
   ├── Valida regras de negócio
   └── Chama Repository

5. [PrismaPersonRepository.findAll()]
   ├── Constrói WHERE clause
   ├── Adiciona paginação (OFFSET, LIMIT)
   ├── Executa query paralela para count
   └── Retorna dados + total

6. [PersonService]
   ├── Mapeia entities para DTOs
   └── Retorna para Controller

7. [PersonController]
   ├── Formata resposta JSON
   └── Envia com status 200

8. [Fastify]
   ├── Request Logger registra fim
   └── Resposta enviada ao cliente
```

---

## Validações de Negócio

### 1. Validação de Manager
```typescript
// Não pode atribuir manager inexistente
if (data.managerId) {
  const exists = await this.repository.exists(data.managerId);
  if (!exists) throw new NotFoundError('Manager', data.managerId);
}
```

### 2. Auto-referência
```typescript
// Pessoa não pode ser seu próprio manager
if (data.managerId === id) {
  throw new ValidationError('A person cannot be their own manager');
}
```

### 3. Referência Circular
```typescript
// Evita loops: A→B→C→A
const chain = await this.repository.findManagementChain(data.managerId);
if (chain.some(p => p.id === id)) {
  throw new ValidationError('Circular reference detected');
}
```

---

## Endpoints da API

### Pessoas
| Método | Endpoint | Descrição | Query Params |
|--------|----------|-----------|--------------|
| GET | `/api/v1/people` | Lista paginada | `page`, `limit`, `search`, `department`, `managerId`, `type`, `status`, `sortBy`, `sortOrder` |
| GET | `/api/v1/people/:id` | Detalhes + relações | - |
| GET | `/api/v1/people/:id/management-chain` | Cadeia até CEO | - |
| POST | `/api/v1/people` | Criar pessoa | - |
| PUT | `/api/v1/people/:id` | Atualizar | - |
| DELETE | `/api/v1/people/:id` | Remover | - |

### Hierarquia e Filtros
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/hierarchy` | Árvore organizacional completa |
| GET | `/api/v1/departments` | Lista de departamentos únicos |
| GET | `/api/v1/managers` | Pessoas que são gestores |
| GET | `/api/v1/statistics` | Totais e contagens |

### Health Checks
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status básico |
| GET | `/health/ready` | Verifica conexão com banco |
| GET | `/health/live` | Liveness probe (Kubernetes) |

---

## Estrutura de Resposta

### Sucesso (Lista)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2024-12-11T10:00:00.000Z"
}
```

### Erro
```json
{
  "statusCode": 404,
  "error": "NotFoundError",
  "message": "Person with ID 999 not found",
  "timestamp": "2024-12-11T10:00:00.000Z",
  "path": "/api/v1/people/999"
}
```

---

## Segurança

| Proteção | Como implementamos |
|----------|-------------------|
| SQL Injection | Prisma usa queries parametrizadas |
| CORS | Configurado para aceitar apenas origem do frontend |
| Validação | Tipos validados no controller |
| Secrets | `.env` não commitado, `DATABASE_URL` em variável |
| HTTPS | Configurado no deploy (Railway/Heroku) |

---

## Performance

| Otimização | Implementação |
|------------|---------------|
| Paginação | Limite máximo de 100 itens |
| Índices | `managerId`, `department`, `type`, `status`, `name` |
| Queries paralelas | `Promise.all` para count + data |
| Connection pooling | Prisma gerencia automaticamente |

---

## Como Rodar

```bash
# Desenvolvimento
npm install
npm run db:push    # Cria tabelas
npm run seed       # Popula 100 pessoas
npm run dev        # http://localhost:3000

# Produção
npm run build      # Compila TypeScript
npm start          # Roda dist/index.js

# Docker
docker-compose up  # Sobe API + PostgreSQL
```

---

## Perguntas Frequentes da Entrevista

### "Por que essa arquitetura em camadas?"

> "Separei em 4 camadas: Presentation (HTTP), Application (regras de negócio), Domain (tipos/interfaces), e Infrastructure (banco de dados). Isso permite:
> 1. **Testar** o service sem banco de dados (mock do repository)
> 2. **Trocar** tecnologias facilmente (ex: Prisma por TypeORM)
> 3. **Organizar** o código de forma que qualquer dev encontre onde mexer"

### "Por que um Service em vez de Use Cases separados?"

> "Use Cases separados (GetAllPeople, CreatePerson, etc.) fazem sentido em sistemas complexos com muitas regras. Para este caso, um único PersonService:
> - É mais simples de entender
> - Tem todas as operações de Person no mesmo lugar
> - Evita duplicação de código entre use cases"

### "Como você testaria isso?"

> "Criaria um `InMemoryPersonRepository` que implementa `IPersonRepository`. Assim testo o PersonService com dados em memória, sem precisar de PostgreSQL. Para integração, usaria testcontainers para subir um PostgreSQL temporário."

### "E se precisasse de mais performance?"

> "Para 100 pessoas, não precisa de nada. Se escalasse para milhões:
> 1. **Cache**: Redis para queries frequentes
> 2. **Read replicas**: PostgreSQL com replicas para leitura
> 3. **Materialized views**: Para hierarquia pré-calculada
> 4. **CDN**: Para assets estáticos"

### "Por que não usou Express?"

> "Fastify é mais moderno e performático. Express é de 2010, Fastify é de 2017. Para um projeto novo, Fastify oferece:
> - 2-5x melhor performance
> - TypeScript nativo
> - Swagger integrado
> - Plugin system mais limpo"

### "O que faria diferente com mais tempo?"

> "Adicionaria:
> 1. **Testes**: Unit tests no service, E2E nos endpoints
> 2. **Cache**: HTTP cache headers para GET requests
> 3. **Rate limiting**: Proteção contra abuse
> 4. **Auth**: JWT para endpoints de escrita
> 5. **CI/CD**: GitHub Actions para deploy automático"

---

## Docker: O que é e Para Que Serve

### O que é Docker?

**Docker é uma plataforma de containerização** que empacota sua aplicação com TODAS as dependências necessárias (Node.js, bibliotecas, configurações) em um "container" isolado e portátil.

**Analogia simples:**
> Imagine que sua aplicação é um sanduíche. Sem Docker, você entrega apenas os ingredientes (código) e espera que o cliente tenha pão, maionese, etc. Com Docker, você entrega o sanduíche completo, pronto para comer, na embalagem certa.

### Por que usar Docker?

| Problema SEM Docker | Solução COM Docker |
|---------------------|-------------------|
| "Funciona na minha máquina mas não no servidor" | Container garante ambiente idêntico |
| Precisa instalar Node, PostgreSQL, bibliotecas | Tudo vem instalado no container |
| Conflito de versões (Node 18 vs 20) | Cada container tem sua versão isolada |
| Setup complexo para novos devs | `docker-compose up` e pronto |

### Conceitos Fundamentais

#### **1. Imagem vs Container**

```
┌─────────────────────────────────────────────┐
│            IMAGEM (Image)                   │
│  É o "molde" / "receita" da aplicação      │
│  - Criada a partir do Dockerfile            │
│  - Imutável (não muda depois de criada)     │
│  - Como um ISO de CD                        │
└─────────────────────────────────────────────┘
                    │
                    │ docker run
                    ▼
┌─────────────────────────────────────────────┐
│           CONTAINER                         │
│  É a aplicação RODANDO                      │
│  - Instância de uma imagem                  │
│  - Pode ter dados que mudam                 │
│  - Como um programa executando              │
└─────────────────────────────────────────────┘
```

**Exemplo:**
- **Imagem**: `node:20-alpine` (Node.js 20 no Alpine Linux)
- **Container**: Seu código rodando dentro dessa imagem

#### **2. Dockerfile**

É o "script de instalação" que define como criar a imagem.

**Nosso Dockerfile explicado linha por linha:**

```dockerfile
# ESTÁGIO 1: BUILD
FROM node:20-alpine AS builder    # Usa Node 20 no Alpine (Linux minimalista)
WORKDIR /app                       # Define pasta de trabalho dentro do container

COPY package*.json ./              # Copia package.json e package-lock.json
RUN npm ci                         # Instala dependências (npm ci é mais rápido)

COPY prisma ./prisma/              # Copia schema do Prisma
RUN npx prisma generate            # Gera Prisma Client

COPY . .                           # Copia todo o código fonte
RUN npm run build                  # Compila TypeScript para JavaScript
RUN npm prune --production         # Remove devDependencies (economiza espaço)

# ESTÁGIO 2: PRODUÇÃO (multi-stage build)
FROM node:20-alpine AS production  # Começa imagem nova, mais limpa
WORKDIR /app

# Cria usuário sem privilégios (segurança)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copia APENAS os arquivos compilados (não copia código fonte)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

USER nodejs                        # Roda como usuário não-root
EXPOSE 3000                        # Documenta que usa porta 3000

CMD ["node", "dist/index.js"]     # Comando para iniciar a aplicação
```

**Por que multi-stage build?**
- Estágio 1 tem ferramentas de build (TypeScript, etc.) - **~500MB**
- Estágio 2 tem APENAS arquivos necessários - **~150MB**
- Imagem final é 3x menor e mais segura

#### **3. Docker Compose**

**Orquestra múltiplos containers** que precisam trabalhar juntos.

```yaml
# docker-compose.yml
services:
  db:                              # Container 1: PostgreSQL
    image: postgres:16-alpine
    ports:
      - "5432:5432"                # Mapeia porta do host → container
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persiste dados

  api:                             # Container 2: Nossa API
    build: .                       # Builda usando Dockerfile local
    depends_on:
      - db                         # Espera o banco subir primeiro
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/jj_orgchart
```

**Como funciona:**
```
┌────────────────────────────────────────────────────┐
│              Docker Network                        │
│                                                    │
│  ┌─────────────┐         ┌──────────────┐        │
│  │   API       │ ------> │ PostgreSQL   │        │
│  │ (port 3000) │         │ (port 5432)  │        │
│  └─────────────┘         └──────────────┘        │
│        │                        │                  │
└────────┼────────────────────────┼──────────────────┘
         │                        │
    localhost:3000          localhost:5432
```

### Nossos 3 Docker Composes

#### **1. docker-compose.yml** (Produção Local)
```yaml
# API + PostgreSQL local
services:
  db:        # PostgreSQL em container
  api:       # API conecta no "db" (nome do serviço)
```
**Uso:** Deploy auto-contido, tudo em Docker

#### **2. docker-compose.dev.yml** (Desenvolvimento)
```yaml
# PostgreSQL + pgAdmin
services:
  db:        # PostgreSQL
  pgadmin:   # Interface web para gerenciar banco
```
**Uso:** Desenvolvimento local, você roda a API com `npm run dev` fora do Docker

#### **3. docker-compose.supabase.yml** (Cloud)
```yaml
# Apenas API (banco no Supabase)
services:
  api:       # Só a API, conecta no Supabase externo
```
**Uso:** API em container, banco gerenciado no Supabase

### Comandos Docker Essenciais

```bash
# ===== IMAGENS =====
docker build -t jj-orgchart-api .     # Cria imagem a partir do Dockerfile
docker images                          # Lista todas as imagens
docker rmi <image-id>                  # Remove uma imagem

# ===== CONTAINERS =====
docker ps                              # Lista containers rodando
docker ps -a                           # Lista todos (inclusive parados)
docker stop <container-id>             # Para um container
docker rm <container-id>               # Remove um container
docker logs <container-id>             # Vê logs do container
docker exec -it <container-id> sh      # Acessa terminal dentro do container

# ===== COMPOSE =====
docker-compose up                      # Sobe todos os serviços
docker-compose up -d                   # Sobe em background (detached)
docker-compose down                    # Para e remove containers
docker-compose logs -f                 # Segue logs em tempo real
docker-compose ps                      # Status dos serviços
```

### Volumes: Persistindo Dados

**Problema:** Quando um container é deletado, os dados somem.

**Solução: Volumes**

```yaml
volumes:
  postgres_data:/var/lib/postgresql/data
```

Isso cria um "disco virtual" persistente no Docker. Mesmo se você destruir o container, os dados do banco ficam salvos.

```
┌──────────────────────────────────────────┐
│         Container (temporário)           │
│  ┌────────────────────────────────┐     │
│  │   PostgreSQL                   │     │
│  │   /var/lib/postgresql/data ────┼─────┼──> Volume (permanente)
│  └────────────────────────────────┘     │      /var/lib/docker/volumes/
└──────────────────────────────────────────┘
```

### Segurança no Docker

#### **1. Non-root User**
```dockerfile
RUN adduser -S nodejs -u 1001
USER nodejs                    # Não roda como root
```
**Por quê?** Se alguém invadir o container, não tem privilégios de root.

#### **2. Multi-stage Build**
- Não inclui ferramentas de build na imagem final
- Menor superfície de ataque

#### **3. Alpine Linux**
```dockerfile
FROM node:20-alpine            # 40MB vs node:20 (950MB)
```
**Por quê?** Menos código = menos vulnerabilidades

#### **4. Health Checks**
```dockerfile
HEALTHCHECK --interval=30s \
  CMD wget --spider http://localhost:3000/health || exit 1
```
O Docker verifica se a aplicação está saudável a cada 30s.

### Fluxo Completo: Dev → Produção

```
1. DESENVOLVIMENTO LOCAL
   ├─ npm run dev                    (sem Docker, mais rápido)
   └─ docker-compose -f docker-compose.dev.yml up  (só banco)

2. TESTE LOCAL COM DOCKER
   ├─ docker build -t jj-orgchart-api .
   └─ docker-compose up               (API + banco em containers)

3. DEPLOY PRODUÇÃO
   ├─ Push para GitHub
   ├─ CI/CD builda imagem
   └─ Deploy em Railway/Fly.io/etc
```

### Por que Docker impressiona em entrevistas?

| Aspecto | Como demonstra profissionalismo |
|---------|--------------------------------|
| **Portabilidade** | "Funciona igual no meu Mac, no Linux do servidor, no Windows do QA" |
| **Reprodutibilidade** | "Qualquer dev faz `docker-compose up` e tem ambiente idêntico" |
| **Isolamento** | "Posso ter Node 18 num projeto e Node 20 em outro, sem conflito" |
| **DevOps** | "Mostra que entendo o ciclo completo: dev → container → deploy" |
| **Segurança** | "Multi-stage build, non-root user, Alpine Linux" |

### Perguntas de Entrevista Comuns

**"Por que usar Docker neste projeto?"**
> "Docker garante que o ambiente de desenvolvimento seja idêntico ao de produção. Um novo dev só precisa de Docker instalado, não precisa instalar Node, PostgreSQL, configurar versions, etc. Além disso, facilita deploy em qualquer cloud que suporte containers (Railway, Fly.io, AWS ECS)."

**"Qual a diferença entre CMD e ENTRYPOINT?"**
> "CMD define o comando padrão, mas pode ser sobrescrito. ENTRYPOINT define o executável fixo. Usei CMD porque permite rodar comandos diferentes facilmente, como `docker run <image> npm run test`."

**"Por que multi-stage build?"**
> "O estágio de build precisa de TypeScript, ferramentas de compilação, etc (~500MB). A imagem final só precisa do JavaScript compilado (~150MB). Isso economiza espaço, reduz tempo de deploy e superfície de ataque."

**"Como você faria deploy disso?"**
> "Subiria a imagem para Docker Hub ou GitHub Container Registry, depois usaria Railway, Fly.io ou AWS ECS. Todas essas plataformas detectam o Dockerfile automaticamente e fazem deploy com um comando."

### Recursos para Aprender Mais

- **Documentação Oficial:** https://docs.docker.com/
- **Play with Docker:** https://labs.play-with-docker.com/ (praticar no navegador)
- **Curso Gratuito:** Docker Getting Started (docker.com/101-tutorial)

---

## Arquivos Principais

```
backend/
├── src/
│   ├── application/
│   │   └── services/PersonService.ts    # Lógica de negócio (~200 linhas)
│   ├── domain/
│   │   ├── entities/Person.ts           # Interfaces de tipos
│   │   └── interfaces/IPersonRepository.ts
│   ├── infrastructure/
│   │   └── repositories/PrismaPersonRepository.ts  # Queries (~390 linhas)
│   ├── presentation/
│   │   ├── controllers/PersonController.ts
│   │   └── routes/personRoutes.ts       # Swagger docs (~335 linhas)
│   ├── config/
│   │   ├── env.ts                       # Variáveis de ambiente
│   │   └── logger.ts                    # Configuração Pino
│   └── server.ts                        # Configuração Fastify
├── prisma/
│   ├── schema.prisma                    # Modelo do banco
│   └── seed.ts                          # Popula 100 pessoas
├── Dockerfile
├── docker-compose.yml
└── package.json
```
