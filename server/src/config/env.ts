import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from correct env file based on environment
const envPathName = process.env.NODE_ENV === 'test' ? '../../.env.test' : '../../.env';
dotenv.config({ path: path.join(__dirname, envPathName) });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid connection string' }),
  JWT_ACCESS_SECRET: z.string().min(16, { message: 'JWT_ACCESS_SECRET must be at least 16 characters' }),
  JWT_REFRESH_SECRET: z.string().min(16, { message: 'JWT_REFRESH_SECRET must be at least 16 characters' }),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
