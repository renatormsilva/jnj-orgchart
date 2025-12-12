import {
  generateId,
  createPaginatedResponse,
  getOffset,
  delay,
  safeJsonParse,
  omit,
  pick,
} from './helpers';
import { PaginationParams } from '../types';

describe('helpers', () => {
  describe('generateId', () => {
    it('should generate a unique UUID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(id1).not.toBe(id2);
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create correct paginated response', () => {
      const data = [1, 2, 3];
      const pagination: PaginationParams = { page: 1, limit: 10 };
      const total = 25;

      const result = createPaginatedResponse(data, total, pagination);

      expect(result.data).toEqual([1, 2, 3]);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrevious).toBe(false);
    });

    it('should handle last page correctly', () => {
      const data = [1, 2, 3];
      const pagination: PaginationParams = { page: 3, limit: 10 };
      const total = 25;

      const result = createPaginatedResponse(data, total, pagination);

      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrevious).toBe(true);
    });

    it('should handle middle page correctly', () => {
      const data = [1, 2, 3];
      const pagination: PaginationParams = { page: 2, limit: 10 };
      const total = 25;

      const result = createPaginatedResponse(data, total, pagination);

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrevious).toBe(true);
    });

    it('should handle single page correctly', () => {
      const data = [1, 2, 3];
      const pagination: PaginationParams = { page: 1, limit: 10 };
      const total = 3;

      const result = createPaginatedResponse(data, total, pagination);

      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrevious).toBe(false);
    });

    it('should handle empty data correctly', () => {
      const data: number[] = [];
      const pagination: PaginationParams = { page: 1, limit: 10 };
      const total = 0;

      const result = createPaginatedResponse(data, total, pagination);

      expect(result.data).toEqual([]);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrevious).toBe(false);
    });
  });

  describe('getOffset', () => {
    it('should calculate correct offset for first page', () => {
      const pagination: PaginationParams = { page: 1, limit: 10 };
      expect(getOffset(pagination)).toBe(0);
    });

    it('should calculate correct offset for second page', () => {
      const pagination: PaginationParams = { page: 2, limit: 10 };
      expect(getOffset(pagination)).toBe(10);
    });

    it('should calculate correct offset for arbitrary page', () => {
      const pagination: PaginationParams = { page: 5, limit: 25 };
      expect(getOffset(pagination)).toBe(100);
    });
  });

  describe('delay', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(90);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const json = '{"name": "John", "age": 30}';
      const result = safeJsonParse(json, {});

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should return fallback for invalid JSON', () => {
      const json = 'invalid json';
      const fallback = { default: true };
      const result = safeJsonParse(json, fallback);

      expect(result).toEqual(fallback);
    });

    it('should return fallback for empty string', () => {
      const json = '';
      const fallback = ['default'];
      const result = safeJsonParse(json, fallback);

      expect(result).toEqual(fallback);
    });
  });

  describe('omit', () => {
    it('should remove specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = omit(obj, ['b', 'd']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should return copy of object when no keys specified', () => {
      const obj = { a: 1, b: 2 };
      const result = omit(obj, []);

      expect(result).toEqual({ a: 1, b: 2 });
      expect(result).not.toBe(obj);
    });

    it('should handle non-existent keys gracefully', () => {
      const obj = { a: 1, b: 2 } as Record<string, unknown>;
      const result = omit(obj, ['c' as keyof typeof obj]);

      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe('pick', () => {
    it('should keep only specified keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = pick(obj, ['a', 'c']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should return empty object when no keys specified', () => {
      const obj = { a: 1, b: 2 };
      const result = pick(obj, []);

      expect(result).toEqual({});
    });

    it('should ignore non-existent keys', () => {
      const obj = { a: 1, b: 2 } as Record<string, unknown>;
      const result = pick(obj, ['a', 'x' as keyof typeof obj]);

      expect(result).toEqual({ a: 1 });
    });
  });
});
