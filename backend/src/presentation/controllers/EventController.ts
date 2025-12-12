import { FastifyRequest, FastifyReply } from 'fastify';
import { eventService, GetEventsQuery } from '../../application/services/EventService';
import { logger } from '../../config/logger';

interface GetEventsQuerystring {
  page?: string;
  limit?: string;
  eventType?: string;
  aggregateType?: string;
  aggregateId?: string;
  fromDate?: string;
  toDate?: string;
}

interface GetEventByIdParams {
  id: string;
}

interface GetAggregateEventsParams {
  aggregateType: string;
  aggregateId: string;
}

class EventController {
  async getAll(
    request: FastifyRequest<{ Querystring: GetEventsQuerystring }>,
    reply: FastifyReply
  ): Promise<void> {
    const { page, limit, eventType, aggregateType, aggregateId, fromDate, toDate } = request.query;

    const query: GetEventsQuery = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      eventType,
      aggregateType,
      aggregateId,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    };

    logger.debug({ query }, 'Fetching events');

    const result = await eventService.getEvents(query);
    reply.send(result);
  }

  async getById(
    request: FastifyRequest<{ Params: GetEventByIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;

    const event = await eventService.getById(id);

    if (!event) {
      reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `Event with ID ${id} not found`,
      });
      return;
    }

    reply.send(event);
  }

  async getAggregateEvents(
    request: FastifyRequest<{ Params: GetAggregateEventsParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const { aggregateType, aggregateId } = request.params;

    const events = await eventService.getAggregateEvents(
      aggregateType as 'Person' | 'System',
      aggregateId
    );

    reply.send({
      aggregateType,
      aggregateId,
      events,
      total: events.length,
    });
  }

  async getStatistics(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const statistics = await eventService.getStatistics();
    reply.send(statistics);
  }
}

export const eventController = new EventController();
