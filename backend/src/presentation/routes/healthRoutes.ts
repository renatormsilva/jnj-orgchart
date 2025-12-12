import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { checkDatabaseHealth } from '../../infrastructure/database/prisma';
import { env } from '../../config/env';

const version = '1.0.0';

export const healthRoutes = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
): Promise<void> => {
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health check',
      description: 'Basic health check endpoint',
      response: {
        200: {
          description: 'Service is healthy',
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'] },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' },
          },
        },
      },
    },
    handler: async (_request, reply) => {
      reply.status(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version,
        environment: env.NODE_ENV,
      });
    },
  });

  fastify.get('/health/ready', {
    schema: {
      tags: ['Health'],
      summary: 'Readiness check',
      description:
        'Check if the service is ready to accept requests (including database connectivity)',
      response: {
        200: {
          description: 'Service is ready',
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ready', 'not_ready'] },
            timestamp: { type: 'string', format: 'date-time' },
            checks: {
              type: 'object',
              properties: {
                database: { type: 'string', enum: ['healthy', 'unhealthy'] },
              },
            },
          },
        },
        503: {
          description: 'Service is not ready',
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ready', 'not_ready'] },
            timestamp: { type: 'string', format: 'date-time' },
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
    handler: async (_request, reply) => {
      const isDatabaseHealthy = await checkDatabaseHealth();

      const response = {
        status: isDatabaseHealthy ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: isDatabaseHealthy ? 'healthy' : 'unhealthy',
        },
      };

      reply.status(isDatabaseHealthy ? 200 : 503).send(response);
    },
  });

  fastify.get('/health/live', {
    schema: {
      tags: ['Health'],
      summary: 'Liveness check',
      description: 'Check if the service is alive (simple ping)',
      response: {
        200: {
          description: 'Service is alive',
          type: 'object',
          properties: {
            status: { type: 'string', const: 'alive' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    handler: async (_request, reply) => {
      reply.status(200).send({
        status: 'alive',
        timestamp: new Date().toISOString(),
      });
    },
  });
};
