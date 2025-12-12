import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { ZodSchema } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (request: FastifyRequest, _reply: FastifyReply, done: HookHandlerDoneFunction): void => {
    try {
      if (schemas.body) {
        request.body = schemas.body.parse(request.body);
      }

      if (schemas.query) {
        request.query = schemas.query.parse(request.query);
      }

      if (schemas.params) {
        request.params = schemas.params.parse(request.params);
      }

      done();
    } catch (error) {
      done(error as Error);
    }
  };
};
