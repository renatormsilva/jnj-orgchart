import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { personController } from '../controllers/PersonController';
import { requireApiKey } from '../middlewares/authMiddleware';

export const personRoutes = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
): Promise<void> => {
  fastify.get('/people', {
    schema: {
      tags: ['People'],
      summary: 'List all people',
      description: 'Get a paginated list of all people with optional filtering and sorting',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string', default: '1' },
          limit: { type: 'string', default: '10' },
          search: { type: 'string' },
          department: { type: 'string' },
          managerId: { type: 'string' },
          type: { type: 'string', enum: ['Employee', 'Partner'] },
          status: { type: 'string', enum: ['Active', 'Inactive'] },
          sortBy: {
            type: 'string',
            enum: ['name', 'jobTitle', 'department', 'createdAt', 'updatedAt'],
          },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
        },
      },
    },
    handler: personController.getAll.bind(personController),
  });

  fastify.get('/people/:id', {
    schema: {
      tags: ['People'],
      summary: 'Get person by ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: personController.getById.bind(personController),
  });

  fastify.get('/people/:id/management-chain', {
    schema: {
      tags: ['People'],
      summary: 'Get management chain',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: personController.getManagementChain.bind(personController),
  });

  fastify.post('/people', {
    preHandler: requireApiKey,
    schema: {
      tags: ['People'],
      summary: 'Create a new person',
      description: 'Create a new person. Requires API key authentication.',
      security: [{ ApiKeyAuth: [] }],
      body: {
        type: 'object',
        required: ['name', 'jobTitle', 'department'],
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
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: personController.create.bind(personController) as any,
  });

  fastify.put('/people/:id', {
    preHandler: requireApiKey,
    schema: {
      tags: ['People'],
      summary: 'Update a person',
      description: 'Update an existing person. Requires API key authentication.',
      security: [{ ApiKeyAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
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
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: personController.update.bind(personController) as any,
  });

  fastify.delete('/people/:id', {
    preHandler: requireApiKey,
    schema: {
      tags: ['People'],
      summary: 'Delete a person',
      description: 'Delete a person. Requires API key authentication.',
      security: [{ ApiKeyAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: personController.delete.bind(personController) as any,
  });

  fastify.get('/hierarchy', {
    schema: {
      tags: ['Hierarchy'],
      summary: 'Get organizational hierarchy',
      querystring: {
        type: 'object',
        properties: {
          rootId: { type: 'string' },
        },
      },
    },
    handler: personController.getHierarchy.bind(personController),
  });

  fastify.get('/departments', {
    schema: {
      tags: ['People'],
      summary: 'Get all departments',
    },
    handler: personController.getDepartments.bind(personController),
  });

  fastify.get('/managers', {
    schema: {
      tags: ['People'],
      summary: 'Get all managers',
    },
    handler: personController.getManagers.bind(personController),
  });

  fastify.get('/statistics', {
    schema: {
      tags: ['People'],
      summary: 'Get organizational statistics',
    },
    handler: personController.getStatistics.bind(personController),
  });
};
