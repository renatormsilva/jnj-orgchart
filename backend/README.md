# J&J OrgChart API

API REST para gerenciamento de organograma da Johnson & Johnson.

## 🏗️ Arquitetura

Este projeto utiliza **Clean Architecture** com as seguintes camadas:

```
src/
├── domain/           # Entidades, Value Objects, Interfaces
├── application/      # Use Cases, DTOs
├── infrastructure/   # Repositories, Database, Event Bus
└── presentation/     # Controllers, Routes, Middlewares
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- PostgreSQL 16+
- npm ou yarn

### Desenvolvimento Local

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Edite .env com suas configurações
```

3. **Subir PostgreSQL com Docker:**
```bash
npm run docker:dev
```

4. **Executar migrations:**
```bash
npm run db:migrate
```

5. **Popular banco de dados:**
```bash
npm run db:seed
```

6. **Iniciar servidor:**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

### Desenvolvimento com Supabase (Alternativa Recomendada)

Se preferir não usar Docker local, você pode usar o **Supabase** como banco de dados hospedado:

1. **Criar conta no Supabase:**
   - Acesse https://supabase.com e crie uma conta
   - Crie um novo projeto

2. **Configurar DATABASE_URL:**
   - Vá em Project Settings > Database
   - Copie a "Connection string" (aba URI)
   - Cole no seu `.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
   ```
   - **Importante:** Se sua senha contiver `@`, codifique como `%40`

3. **Executar setup:**
   ```bash
   npm install
   npm run db:generate
   npx prisma db push      # Ao invés de db:migrate
   npm run db:seed
   npm run dev
   ```

4. **Vantagens do Supabase:**
   - ✅ Sem necessidade de Docker
   - ✅ Interface web para gerenciar dados
   - ✅ Backups automáticos
   - ✅ Gratuito para desenvolvimento

## 📚 Documentação da API

Acesse a documentação Swagger em: `http://localhost:3000/docs`

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /health | Health check |
| GET | /api/v1/people | Listar pessoas (paginado) |
| GET | /api/v1/people/:id | Buscar pessoa por ID |
| POST | /api/v1/people | Criar pessoa |
| PUT | /api/v1/people/:id | Atualizar pessoa |
| DELETE | /api/v1/people/:id | Deletar pessoa |
| GET | /api/v1/hierarchy | Árvore hierárquica |
| GET | /api/v1/departments | Listar departamentos |
| GET | /api/v1/managers | Listar managers |
| GET | /api/v1/statistics | Estatísticas |

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Servidor em modo desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run lint         # Verificar código
npm run test         # Executar testes
npm run db:migrate   # Executar migrations
npm run db:seed      # Popular banco de dados
npm run db:studio    # Abrir Prisma Studio
```

## 🐳 Docker

### Com PostgreSQL local:
```bash
# Build da imagem
docker build -t jj-orgchart-api .

# Executar com banco local
docker-compose up -d
```

### Com Supabase:
```bash
# Build da imagem
docker build -t jj-orgchart-api .

# Executar apenas a API (banco no Supabase)
docker-compose -f docker-compose.supabase.yml up -d
```

## 📊 Estrutura do Banco de Dados

### Tabela `people`
- `id` - ID único
- `name` - Nome completo
- `job_title` - Cargo
- `department` - Departamento
- `manager_id` - ID do gestor (FK)
- `photo_path` - Caminho da foto
- `type` - Employee | Partner
- `status` - Active | Inactive
- `email`, `phone`, `location`, `hire_date`
- `created_at`, `updated_at`

### Tabela `event_logs`
- Armazena eventos de domínio para auditoria

### Tabela `audit_logs`
- Log de alterações em entidades

## 🔧 Tecnologias

- **Runtime:** Node.js 20
- **Framework:** Fastify
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco:** PostgreSQL
- **Validação:** Zod
- **Documentação:** Swagger/OpenAPI
- **Logs:** Pino
- **Container:** Docker

## 📝 Licença

MIT
