import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { env } from '../../config/env';

export const requireApiKey = async (request: FastifyRequest, _reply: FastifyReply) => {
  if (!env.API_KEY_ENABLED) {
    return;
  }

  const apiKey = request.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new UnauthorizedError('API key is required. Please provide X-API-Key header.');
  }

  if (apiKey !== env.API_KEY) {
    throw new UnauthorizedError('Invalid API key');
  }
};

export const optionalApiKey = async (request: FastifyRequest, _reply: FastifyReply) => {
  if (!env.API_KEY_ENABLED) {
    return;
  }

  const apiKey = request.headers['x-api-key'] as string;

  if (apiKey && apiKey !== env.API_KEY) {
    throw new UnauthorizedError('Invalid API key');
  }
};
