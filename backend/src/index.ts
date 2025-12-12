import { buildServer } from './server';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase, disconnectDatabase } from './infrastructure/database/prisma';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    const server = await buildServer();

    await server.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(`🚀 Server running at http://${env.HOST}:${env.PORT}`);
    logger.info(`📚 Swagger docs at http://${env.HOST}:${env.PORT}/docs`);
    logger.info(`🔧 Environment: ${env.NODE_ENV}`);

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received, shutting down gracefully...`);

      try {
        await server.close();
        await disconnectDatabase();
        logger.info('Server shut down successfully');
        process.exit(0);
      } catch (error) {
        logger.error({ error }, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
    process.on('SIGINT', () => {
      void shutdown('SIGINT');
    });

    process.on('uncaughtException', error => {
      logger.fatal({ msg: 'Uncaught Exception', error });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.fatal({ msg: 'Unhandled Rejection', reason, promise });
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ msg: 'Failed to start server', error });
    process.exit(1);
  }
};

void startServer();
