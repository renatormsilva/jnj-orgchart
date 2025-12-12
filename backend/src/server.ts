import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './presentation/middlewares/errorHandler';
import { requestLogger } from './presentation/middlewares/requestLogger';
import { healthRoutes } from './presentation/routes/healthRoutes';
import { personRoutes } from './presentation/routes/personRoutes';
import { eventRoutes } from './presentation/routes/eventRoutes';

export const buildServer = async (): Promise<FastifyInstance> => {
  const server = Fastify({
    logger: false, // We use our custom logger
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    genReqId: () => crypto.randomUUID(),
  });

  // Register plugins
  await server.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await server.register(helmet, {
    contentSecurityPolicy: false, // Disable for Swagger UI
  });

  // Swagger documentation
  await server.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'J&J OrgChart API',
        description: `
## Johnson & Johnson Organizational Chart API

This API provides endpoints to manage and visualize the organizational hierarchy at Johnson & Johnson.

### Features
- 📋 **List & Filter** - Get all people with filtering, sorting, and pagination
- 🌳 **Hierarchy** - Visualize organizational structure
- 👤 **Person Details** - Get detailed information including direct reports
- 📝 **CRUD Operations** - Create, update, and delete people
- 📊 **Analytics** - Track usage and events

### Authentication
Write operations (POST, PUT, DELETE) require API key authentication via \`X-API-Key\` header.

### Rate Limiting
No rate limiting is currently enforced.
        `,
        version: '1.0.0',
        contact: {
          name: 'J&J Tech Team',
          email: 'tech@jnj.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
        {
          url: 'https://api.jj-orgchart.com',
          description: 'Production server',
        },
      ],
      tags: [
        {
          name: 'Health',
          description: 'Health check endpoints',
        },
        {
          name: 'People',
          description: 'People management endpoints',
        },
        {
          name: 'Hierarchy',
          description: 'Organizational hierarchy endpoints',
        },
        {
          name: 'Events',
          description: 'Event logging and management endpoints',
        },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key for write operations (POST, PUT, DELETE)',
          },
        },
        schemas: {
          Person: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Alex Johnson' },
              jobTitle: { type: 'string', example: 'General Manager' },
              department: { type: 'string', example: 'Executive' },
              managerId: { type: 'integer', nullable: true, example: null },
              photoPath: { type: 'string', example: '/photos/1' },
              type: { type: 'string', enum: ['Employee', 'Partner'], example: 'Employee' },
              status: { type: 'string', enum: ['Active', 'Inactive'], example: 'Active' },
              email: { type: 'string', example: 'alex.johnson@jnj.com' },
              phone: { type: 'string', example: '+1 234 567 8901' },
              location: { type: 'string', example: 'New Brunswick, NJ' },
              hireDate: { type: 'string', format: 'date', example: '2020-01-15' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          PersonWithRelations: {
            allOf: [
              { $ref: '#/components/schemas/Person' },
              {
                type: 'object',
                properties: {
                  manager: { $ref: '#/components/schemas/Person', nullable: true },
                  directReports: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Person' },
                  },
                },
              },
            ],
          },
          HierarchyNode: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              jobTitle: { type: 'string' },
              department: { type: 'string' },
              photoPath: { type: 'string' },
              type: { type: 'string', enum: ['Employee', 'Partner'] },
              status: { type: 'string', enum: ['Active', 'Inactive'] },
              children: {
                type: 'array',
                items: { $ref: '#/components/schemas/HierarchyNode' },
              },
            },
          },
          CreatePersonRequest: {
            type: 'object',
            required: ['name', 'jobTitle', 'department'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 255 },
              jobTitle: { type: 'string', minLength: 2, maxLength: 255 },
              department: { type: 'string', minLength: 2, maxLength: 100 },
              managerId: { type: 'integer', nullable: true },
              photoPath: { type: 'string' },
              type: { type: 'string', enum: ['Employee', 'Partner'], default: 'Employee' },
              status: { type: 'string', enum: ['Active', 'Inactive'], default: 'Active' },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              location: { type: 'string' },
              hireDate: { type: 'string', format: 'date' },
            },
          },
          UpdatePersonRequest: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 255 },
              jobTitle: { type: 'string', minLength: 2, maxLength: 255 },
              department: { type: 'string', minLength: 2, maxLength: 100 },
              managerId: { type: 'integer', nullable: true },
              photoPath: { type: 'string' },
              type: { type: 'string', enum: ['Employee', 'Partner'] },
              status: { type: 'string', enum: ['Active', 'Inactive'] },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              location: { type: 'string' },
              hireDate: { type: 'string', format: 'date' },
            },
          },
          PaginatedResponse: {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/Person' } },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer', example: 1 },
                  limit: { type: 'integer', example: 10 },
                  total: { type: 'integer', example: 100 },
                  totalPages: { type: 'integer', example: 10 },
                  hasNext: { type: 'boolean', example: true },
                  hasPrevious: { type: 'boolean', example: false },
                },
              },
            },
          },
          ApiError: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer', example: 400 },
              error: { type: 'string', example: 'Bad Request' },
              message: { type: 'string', example: 'Validation failed' },
              details: { type: 'object' },
              timestamp: { type: 'string', format: 'date-time' },
              path: { type: 'string', example: '/api/v1/people' },
              requestId: { type: 'string', format: 'uuid' },
            },
          },
          HealthCheck: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'unhealthy'] },
              timestamp: { type: 'string', format: 'date-time' },
              uptime: { type: 'number' },
              version: { type: 'string' },
              checks: {
                type: 'object',
                properties: {
                  database: { type: 'string', enum: ['healthy', 'unhealthy'] },
                },
              },
            },
          },
        },
      },
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
    },
    staticCSP: true,
    transformSpecification: swaggerObject => swaggerObject,
    transformSpecificationClone: true,
  });

  // Custom middlewares
  server.addHook('onRequest', requestLogger);
  server.setErrorHandler(errorHandler);

  // Register routes
  await server.register(healthRoutes);
  await server.register(personRoutes, { prefix: env.API_PREFIX });
  await server.register(eventRoutes, { prefix: env.API_PREFIX });

  // Root route
  server.get('/', () => ({
    name: 'J&J OrgChart API',
    version: '1.0.0',
    docs: '/docs',
    health: '/health',
  }));

  logger.info('Server built successfully');

  return server;
};
