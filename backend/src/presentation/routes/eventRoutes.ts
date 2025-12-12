import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { eventController } from '../controllers/EventController';
import { requireApiKey } from '../middlewares/authMiddleware';

export const eventRoutes = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
): Promise<void> => {
  fastify.addHook('preHandler', requireApiKey);

  fastify.get('/events', {
    schema: {
      tags: ['Events'],
      summary: 'List all events',
      description:
        'Get a paginated list of all events with optional filtering. Requires API key authentication.',
      security: [{ ApiKeyAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string', default: '1' },
          limit: { type: 'string', default: '20' },
          eventType: {
            type: 'string',
            enum: [
              'person.created',
              'person.updated',
              'person.deleted',
              'person.manager_changed',
              'person.status_changed',
              'system.startup',
              'system.shutdown',
              'system.health_check',
            ],
          },
          aggregateType: { type: 'string', enum: ['Person', 'System'] },
          aggregateId: { type: 'string' },
          fromDate: { type: 'string', format: 'date-time' },
          toDate: { type: 'string', format: 'date-time' },
        },
      },
    },
    handler: eventController.getAll.bind(eventController),
  });

  fastify.get('/events/statistics', {
    schema: {
      tags: ['Events'],
      summary: 'Get event statistics',
      security: [{ ApiKeyAuth: [] }],
    },
    handler: eventController.getStatistics.bind(eventController),
  });

  fastify.get('/events/:id', {
    schema: {
      tags: ['Events'],
      summary: 'Get event by ID',
      security: [{ ApiKeyAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: eventController.getById.bind(eventController),
  });

  fastify.get('/events/aggregate/:aggregateType/:aggregateId', {
    schema: {
      tags: ['Events'],
      summary: 'Get events for an aggregate',
      security: [{ ApiKeyAuth: [] }],
      params: {
        type: 'object',
        required: ['aggregateType', 'aggregateId'],
        properties: {
          aggregateType: { type: 'string', enum: ['Person', 'System'] },
          aggregateId: { type: 'string' },
        },
      },
    },
    handler: eventController.getAggregateEvents.bind(eventController),
  });
};
