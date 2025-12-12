import { FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../../config/logger';

export const requestLogger = async (
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> => {
  const startTime = Date.now();

  logger.info({
    msg: 'Incoming request',
    requestId: request.id,
    method: request.method,
    url: request.url,
    query: request.query,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
  });

  request.raw.on('close', () => {
    const duration = Date.now() - startTime;

    logger.info({
      msg: 'Request completed',
      requestId: request.id,
      method: request.method,
      url: request.url,
      duration: `${duration}ms`,
    });
  });
};
