import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../config/logger';
import { ApiError } from '../../shared/types';

export const errorHandler = (
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  const requestId = request.id;
  const timestamp = new Date().toISOString();
  const path = request.url;

  // Log the error
  logger.error({
    msg: 'Request error',
    requestId,
    path,
    method: request.method,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const apiError: ApiError = {
      statusCode: 400,
      error: 'Validation Error',
      message: 'Request validation failed',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
      timestamp,
      path,
      requestId,
    };

    reply.status(400).send(apiError);
    return;
  }

  // Handle AppError (our custom errors)
  if (error instanceof AppError) {
    const apiError: ApiError = {
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
      details: error.details,
      timestamp,
      path,
      requestId,
    };

    reply.status(error.statusCode).send(apiError);
    return;
  }

  // Handle Fastify errors (validation, etc)
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    const apiError: ApiError = {
      statusCode: error.statusCode,
      error: error.name || 'Error',
      message: error.message,
      timestamp,
      path,
      requestId,
    };

    reply.status(error.statusCode).send(apiError);
    return;
  }

  // Handle unknown errors
  const apiError: ApiError = {
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp,
    path,
    requestId,
  };

  reply.status(500).send(apiError);
};
