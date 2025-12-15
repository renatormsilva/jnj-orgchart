import { EventService, PersonEvents } from './EventService';
import { prisma } from '../../infrastructure/database/prisma';

// Mock Prisma
jest.mock('../../infrastructure/database/prisma', () => ({
  prisma: {
    eventLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

// Mock logger
jest.mock('../../config/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    service = new EventService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('publish', () => {
    it('should create an event in the database', async () => {
      const mockEvent = {
        id: 'uuid-123',
        eventType: 'person.created',
        aggregateType: 'Person',
        aggregateId: '1',
        payload: { person: { id: 1, name: 'Test Person' } },
        metadata: null,
        occurredAt: new Date('2025-01-01T00:00:00Z'),
      };

      (prisma.eventLog.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await service.publish({
        eventType: 'person.created',
        aggregateType: 'Person',
        aggregateId: '1',
        payload: { person: { id: 1, name: 'Test Person' } },
      });

      expect(prisma.eventLog.create).toHaveBeenCalledWith({
        data: {
          eventType: 'person.created',
          aggregateType: 'Person',
          aggregateId: '1',
          payload: { person: { id: 1, name: 'Test Person' } },
          metadata: undefined,
        },
      });

      expect(result).toEqual({
        id: 'uuid-123',
        eventType: 'person.created',
        aggregateType: 'Person',
        aggregateId: '1',
        payload: { person: { id: 1, name: 'Test Person' } },
        metadata: null,
        occurredAt: '2025-01-01T00:00:00.000Z',
      });
    });

    it('should include metadata when provided', async () => {
      const mockEvent = {
        id: 'uuid-456',
        eventType: 'person.updated',
        aggregateType: 'Person',
        aggregateId: '2',
        payload: { before: {}, after: {} },
        metadata: { userId: 'user-123', ipAddress: '127.0.0.1' },
        occurredAt: new Date('2025-01-01T00:00:00Z'),
      };

      (prisma.eventLog.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await service.publish({
        eventType: 'person.updated',
        aggregateType: 'Person',
        aggregateId: '2',
        payload: { before: {}, after: {} },
        metadata: { userId: 'user-123', ipAddress: '127.0.0.1' },
      });

      expect(result.metadata).toEqual({ userId: 'user-123', ipAddress: '127.0.0.1' });
    });
  });

  describe('getEvents', () => {
    it('should return paginated events', async () => {
      const mockEvents = [
        {
          id: 'uuid-1',
          eventType: 'person.created',
          aggregateType: 'Person',
          aggregateId: '1',
          payload: {},
          metadata: null,
          occurredAt: new Date('2025-01-01T00:00:00Z'),
        },
        {
          id: 'uuid-2',
          eventType: 'person.updated',
          aggregateType: 'Person',
          aggregateId: '2',
          payload: {},
          metadata: null,
          occurredAt: new Date('2025-01-02T00:00:00Z'),
        },
      ];

      (prisma.eventLog.findMany as jest.Mock).mockResolvedValue(mockEvents);
      (prisma.eventLog.count as jest.Mock).mockResolvedValue(2);

      const result = await service.getEvents({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by eventType', async () => {
      (prisma.eventLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.eventLog.count as jest.Mock).mockResolvedValue(0);

      await service.getEvents({ eventType: 'person.created' });

      expect(prisma.eventLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'person.created',
          }),
        })
      );
    });

    it('should filter by aggregateType and aggregateId', async () => {
      (prisma.eventLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.eventLog.count as jest.Mock).mockResolvedValue(0);

      await service.getEvents({ aggregateType: 'Person', aggregateId: '5' });

      expect(prisma.eventLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            aggregateType: 'Person',
            aggregateId: '5',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      const fromDate = new Date('2025-01-01');
      const toDate = new Date('2025-01-31');

      (prisma.eventLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.eventLog.count as jest.Mock).mockResolvedValue(0);

      await service.getEvents({ fromDate, toDate });

      expect(prisma.eventLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            occurredAt: {
              gte: fromDate,
              lte: toDate,
            },
          }),
        })
      );
    });
  });

  describe('getAggregateEvents', () => {
    it('should return events for a specific aggregate', async () => {
      const mockEvents = [
        {
          id: 'uuid-1',
          eventType: 'person.created',
          aggregateType: 'Person',
          aggregateId: '5',
          payload: {},
          metadata: null,
          occurredAt: new Date('2025-01-01T00:00:00Z'),
        },
      ];

      (prisma.eventLog.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await service.getAggregateEvents('Person', '5');

      expect(prisma.eventLog.findMany).toHaveBeenCalledWith({
        where: {
          aggregateType: 'Person',
          aggregateId: '5',
        },
        orderBy: { occurredAt: 'desc' },
      });

      expect(result).toHaveLength(1);
      expect(result[0]?.aggregateId).toBe('5');
    });
  });

  describe('getById', () => {
    it('should return event by id', async () => {
      const mockEvent = {
        id: 'uuid-123',
        eventType: 'person.created',
        aggregateType: 'Person',
        aggregateId: '1',
        payload: {},
        metadata: null,
        occurredAt: new Date('2025-01-01T00:00:00Z'),
      };

      (prisma.eventLog.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const result = await service.getById('uuid-123');

      expect(prisma.eventLog.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });

      expect(result).not.toBeNull();
      expect(result?.id).toBe('uuid-123');
    });

    it('should return null for non-existent event', async () => {
      (prisma.eventLog.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('should return event statistics', async () => {
      (prisma.eventLog.count as jest.Mock).mockResolvedValue(100);
      (prisma.eventLog.groupBy as jest.Mock).mockResolvedValue([
        { eventType: 'person.created', _count: { eventType: 50 } },
        { eventType: 'person.updated', _count: { eventType: 30 } },
        { eventType: 'person.deleted', _count: { eventType: 20 } },
      ]);
      (prisma.eventLog.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getStatistics();

      expect(result.totalEvents).toBe(100);
      expect(result.eventsByType).toHaveLength(3);
      expect(result.eventsByType[0]).toEqual({
        eventType: 'person.created',
        count: 50,
      });
    });
  });
});

describe('PersonEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('created', () => {
    it('should publish person.created event', async () => {
      const mockEvent = {
        id: 'uuid-123',
        eventType: 'person.created',
        aggregateType: 'Person',
        aggregateId: '1',
        payload: { person: { id: 1, name: 'John Doe' } },
        metadata: null,
        occurredAt: new Date(),
      };

      (prisma.eventLog.create as jest.Mock).mockResolvedValue(mockEvent);

      await PersonEvents.created({ id: 1, name: 'John Doe' });

      expect(prisma.eventLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'person.created',
          aggregateType: 'Person',
          aggregateId: '1',
        }),
      });
    });
  });

  describe('updated', () => {
    it('should publish person.updated event', async () => {
      const mockEvent = {
        id: 'uuid-123',
        eventType: 'person.updated',
        aggregateType: 'Person',
        aggregateId: '1',
        payload: { before: { name: 'Old' }, after: { name: 'New' } },
        metadata: null,
        occurredAt: new Date(),
      };

      (prisma.eventLog.create as jest.Mock).mockResolvedValue(mockEvent);

      await PersonEvents.updated(1, { before: { name: 'Old' }, after: { name: 'New' } });

      expect(prisma.eventLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'person.updated',
          aggregateType: 'Person',
          aggregateId: '1',
        }),
      });
    });
  });

  describe('deleted', () => {
    it('should publish person.deleted event', async () => {
      const mockEvent = {
        id: 'uuid-123',
        eventType: 'person.deleted',
        aggregateType: 'Person',
        aggregateId: '1',
        payload: { deletedPerson: { id: 1, name: 'John Doe' } },
        metadata: null,
        occurredAt: new Date(),
      };

      (prisma.eventLog.create as jest.Mock).mockResolvedValue(mockEvent);

      await PersonEvents.deleted(1, { id: 1, name: 'John Doe' });

      expect(prisma.eventLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'person.deleted',
          aggregateType: 'Person',
          aggregateId: '1',
        }),
      });
    });
  });

  describe('managerChanged', () => {
    it('should publish person.manager_changed event', async () => {
      const mockEvent = {
        id: 'uuid-123',
        eventType: 'person.manager_changed',
        aggregateType: 'Person',
        aggregateId: '1',
        payload: { oldManagerId: 2, newManagerId: 3 },
        metadata: null,
        occurredAt: new Date(),
      };

      (prisma.eventLog.create as jest.Mock).mockResolvedValue(mockEvent);

      await PersonEvents.managerChanged(1, 2, 3);

      expect(prisma.eventLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'person.manager_changed',
          aggregateType: 'Person',
          aggregateId: '1',
          payload: { oldManagerId: 2, newManagerId: 3 },
        }),
      });
    });
  });

  describe('statusChanged', () => {
    it('should publish person.status_changed event', async () => {
      const mockEvent = {
        id: 'uuid-123',
        eventType: 'person.status_changed',
        aggregateType: 'Person',
        aggregateId: '1',
        payload: { oldStatus: 'Active', newStatus: 'Inactive' },
        metadata: null,
        occurredAt: new Date(),
      };

      (prisma.eventLog.create as jest.Mock).mockResolvedValue(mockEvent);

      await PersonEvents.statusChanged(1, 'Active', 'Inactive');

      expect(prisma.eventLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'person.status_changed',
          aggregateType: 'Person',
          aggregateId: '1',
          payload: { oldStatus: 'Active', newStatus: 'Inactive' },
        }),
      });
    });
  });
});
