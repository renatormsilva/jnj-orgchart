import { PrismaClient } from '@prisma/client';
import { logger } from '../../config/logger';
import { env } from '../../config/env';

const prismaClientSingleton = (): PrismaClient => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });

  // Log queries in development
  if (env.NODE_ENV === 'development') {
    client.$on('query', (e: { query: string; params: string; duration: number }) => {
      logger.debug(
        { query: e.query, params: e.params, duration: `${e.duration}ms` },
        'Database Query'
      );
    });
  }

  // Log errors
  client.$on('error', (e: { message: string }) => {
    logger.error({ errorMessage: e.message }, 'Database Error');
  });

  return client;
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Connect to database with retry logic
 */
export const connectDatabase = async (maxRetries = 5, delay = 5000): Promise<void> => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      logger.info('✅ Database connected successfully');
      return;
    } catch (error) {
      retries++;
      logger.warn(`Database connection attempt ${retries}/${maxRetries} failed`);

      if (retries === maxRetries) {
        logger.error('❌ Failed to connect to database after maximum retries');
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Disconnect from database
 */
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

/**
 * Health check for database
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};
