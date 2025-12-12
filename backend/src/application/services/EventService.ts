import { prisma } from '../../infrastructure/database/prisma';
import { logger } from '../../config/logger';

export type AggregateType = 'Person' | 'System';

export type PersonEventType =
  | 'person.created'
  | 'person.updated'
  | 'person.deleted'
  | 'person.manager_changed'
  | 'person.status_changed';

export type SystemEventType = 'system.startup' | 'system.shutdown' | 'system.health_check';

export type EventType = PersonEventType | SystemEventType;

export interface EventPayload {
  [key: string]: unknown;
}

export interface EventMetadata {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  source?: string;
  [key: string]: unknown;
}

export interface CreateEventInput {
  eventType: EventType;
  aggregateType: AggregateType;
  aggregateId: string;
  payload: EventPayload;
  metadata?: EventMetadata;
}

export interface EventResponse {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: EventPayload;
  metadata: EventMetadata | null;
  occurredAt: string;
}

export interface GetEventsQuery {
  page?: number;
  limit?: number;
  eventType?: string;
  aggregateType?: string;
  aggregateId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface PaginatedEvents {
  data: EventResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type EventSubscriber = (event: EventResponse) => void | Promise<void>;

const subscribers: Map<EventType | '*', EventSubscriber[]> = new Map();

export class EventService {
  async publish(input: CreateEventInput): Promise<EventResponse> {
    const event = await prisma.eventLog.create({
      data: {
        eventType: input.eventType,
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        payload: input.payload as object,
        metadata: input.metadata as object | undefined,
      },
    });

    const response = this.toResponse(event);

    logger.info(
      {
        eventId: event.id,
        eventType: event.eventType,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
      },
      `Event published: ${event.eventType}`
    );

    await this.notifySubscribers(input.eventType, response);

    return response;
  }

  async getEvents(query: GetEventsQuery = {}): Promise<PaginatedEvents> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.eventType && { eventType: query.eventType }),
      ...(query.aggregateType && { aggregateType: query.aggregateType }),
      ...(query.aggregateId && { aggregateId: query.aggregateId }),
      ...(query.fromDate || query.toDate
        ? {
            occurredAt: {
              ...(query.fromDate && { gte: query.fromDate }),
              ...(query.toDate && { lte: query.toDate }),
            },
          }
        : {}),
    };

    const [events, total] = await Promise.all([
      prisma.eventLog.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.eventLog.count({ where }),
    ]);

    return {
      data: events.map(e => this.toResponse(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAggregateEvents(
    aggregateType: AggregateType,
    aggregateId: string
  ): Promise<EventResponse[]> {
    const events = await prisma.eventLog.findMany({
      where: {
        aggregateType,
        aggregateId,
      },
      orderBy: { occurredAt: 'desc' },
    });

    return events.map(e => this.toResponse(e));
  }

  async getById(id: string): Promise<EventResponse | null> {
    const event = await prisma.eventLog.findUnique({
      where: { id },
    });

    return event ? this.toResponse(event) : null;
  }

  async getStatistics(): Promise<{
    totalEvents: number;
    eventsByType: Array<{ eventType: string; count: number }>;
    recentEvents: EventResponse[];
  }> {
    const [totalEvents, eventsByType, recentEvents] = await Promise.all([
      prisma.eventLog.count(),
      prisma.eventLog.groupBy({
        by: ['eventType'],
        _count: { eventType: true },
        orderBy: { _count: { eventType: 'desc' } },
      }),
      prisma.eventLog.findMany({
        orderBy: { occurredAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalEvents,
      eventsByType: eventsByType.map(e => ({
        eventType: e.eventType,
        count: e._count.eventType,
      })),
      recentEvents: recentEvents.map(e => this.toResponse(e)),
    };
  }

  subscribe(eventType: EventType | '*', callback: EventSubscriber): void {
    const existing = subscribers.get(eventType) ?? [];
    existing.push(callback);
    subscribers.set(eventType, existing);
    logger.debug({ eventType }, 'Subscriber registered');
  }

  unsubscribe(eventType: EventType | '*', callback: EventSubscriber): void {
    const existing = subscribers.get(eventType) ?? [];
    const filtered = existing.filter(cb => cb !== callback);
    subscribers.set(eventType, filtered);
  }

  private async notifySubscribers(eventType: EventType, event: EventResponse): Promise<void> {
    const specificSubscribers = subscribers.get(eventType) ?? [];
    for (const subscriber of specificSubscribers) {
      try {
        await subscriber(event);
      } catch (error) {
        logger.error({ error, eventType }, 'Error notifying subscriber');
      }
    }

    const wildcardSubscribers = subscribers.get('*') ?? [];
    for (const subscriber of wildcardSubscribers) {
      try {
        await subscriber(event);
      } catch (error) {
        logger.error({ error, eventType }, 'Error notifying wildcard subscriber');
      }
    }
  }

  private toResponse(event: {
    id: string;
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    payload: unknown;
    metadata: unknown;
    occurredAt: Date;
  }): EventResponse {
    return {
      id: event.id,
      eventType: event.eventType,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      payload: event.payload as EventPayload,
      metadata: event.metadata as EventMetadata | null,
      occurredAt: event.occurredAt.toISOString(),
    };
  }
}

export const eventService = new EventService();

export const PersonEvents = {
  async created(person: { id: number; name: string }, metadata?: EventMetadata): Promise<void> {
    await eventService.publish({
      eventType: 'person.created',
      aggregateType: 'Person',
      aggregateId: person.id.toString(),
      payload: { person: { ...person } },
      metadata,
    });
  },

  async updated(
    personId: number,
    changes: { before: unknown; after: unknown },
    metadata?: EventMetadata
  ): Promise<void> {
    await eventService.publish({
      eventType: 'person.updated',
      aggregateType: 'Person',
      aggregateId: personId.toString(),
      payload: changes,
      metadata,
    });
  },

  async deleted(personId: number, personData: unknown, metadata?: EventMetadata): Promise<void> {
    await eventService.publish({
      eventType: 'person.deleted',
      aggregateType: 'Person',
      aggregateId: personId.toString(),
      payload: { deletedPerson: personData },
      metadata,
    });
  },

  async managerChanged(
    personId: number,
    oldManagerId: number | null,
    newManagerId: number | null,
    metadata?: EventMetadata
  ): Promise<void> {
    await eventService.publish({
      eventType: 'person.manager_changed',
      aggregateType: 'Person',
      aggregateId: personId.toString(),
      payload: { oldManagerId, newManagerId },
      metadata,
    });
  },

  async statusChanged(
    personId: number,
    oldStatus: string,
    newStatus: string,
    metadata?: EventMetadata
  ): Promise<void> {
    await eventService.publish({
      eventType: 'person.status_changed',
      aggregateType: 'Person',
      aggregateId: personId.toString(),
      payload: { oldStatus, newStatus },
      metadata,
    });
  },
};
