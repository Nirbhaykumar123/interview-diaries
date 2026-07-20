import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

async function bootstrap() {
  try {
    // Verify database connection on startup
    await prisma.$connect();
    console.log('✅ Database connection verified successfully.');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // Graceful Shutdown handles termination signals (SIGTERM, SIGINT) by 
    // closing the web server first, then disconnecting the database pool,
    // preventing dangling TCP connections.
    const handleShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('HTTP server closed.');
        await prisma.$disconnect();
        console.log('Prisma connection pool released. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to verify database connection or boot server:', error);
    process.exit(1);
  }
}

bootstrap();
