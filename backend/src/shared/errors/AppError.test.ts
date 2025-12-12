import {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  InternalError,
  DatabaseError,
} from './AppError';

describe('AppError', () => {
  describe('NotFoundError', () => {
    it('should create error with resource and identifier', () => {
      const error = new NotFoundError('User', 123);

      expect(error.message).toBe("User with identifier '123' not found");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
      expect(error.isOperational).toBe(true);
    });

    it('should create error with only resource', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });

    it('should serialize to JSON correctly', () => {
      const error = new NotFoundError('User', 'abc-123');
      const json = error.toJSON();

      expect(json.name).toBe('NotFoundError');
      expect(json.message).toBe("User with identifier 'abc-123' not found");
      expect(json.statusCode).toBe(404);
    });
  });

  describe('ValidationError', () => {
    it('should create error with message', () => {
      const error = new ValidationError('Invalid email format');

      expect(error.message).toBe('Invalid email format');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
      expect(error.isOperational).toBe(true);
    });

    it('should create error with details', () => {
      const details = { field: 'email', rule: 'format' };
      const error = new ValidationError('Invalid input', details);

      expect(error.details).toEqual(details);
      expect(error.toJSON().details).toEqual(details);
    });
  });

  describe('ConflictError', () => {
    it('should create error with correct status code', () => {
      const error = new ConflictError('Email already exists');

      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
      expect(error.isOperational).toBe(true);
    });

    it('should include details when provided', () => {
      const error = new ConflictError('Duplicate entry', { field: 'email' });

      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with default message', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create error with custom message', () => {
      const error = new UnauthorizedError('Token expired');

      expect(error.message).toBe('Token expired');
    });
  });

  describe('ForbiddenError', () => {
    it('should create error with default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Access forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('ForbiddenError');
    });

    it('should create error with custom message', () => {
      const error = new ForbiddenError('Insufficient permissions');

      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('InternalError', () => {
    it('should create error with default message', () => {
      const error = new InternalError();

      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('InternalError');
      expect(error.isOperational).toBe(false);
    });

    it('should create error with custom message and details', () => {
      const error = new InternalError('Database connection failed', { host: 'localhost' });

      expect(error.message).toBe('Database connection failed');
      expect(error.details).toEqual({ host: 'localhost' });
    });
  });

  describe('DatabaseError', () => {
    it('should create error with message', () => {
      const error = new DatabaseError('Query failed');

      expect(error.message).toBe('Query failed');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
      expect(error.isOperational).toBe(false);
    });

    it('should include details when provided', () => {
      const error = new DatabaseError('Connection timeout', { timeout: 30000 });

      expect(error.details).toEqual({ timeout: 30000 });
    });
  });

  describe('Error inheritance', () => {
    it('should be instance of Error', () => {
      const error = new ValidationError('test');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should have stack trace', () => {
      const error = new NotFoundError('Test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('NotFoundError');
    });
  });
});
