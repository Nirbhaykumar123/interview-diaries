import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================

// HTTP Request Logger
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// CORS Configuration
// Allow dynamic localhost port mappings in development and specified origins
const corsOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
      if (corsOrigins.includes(origin) || isLocalhost) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Payload Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Static File Server (For locally uploaded avatars and images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ==========================================
// ROUTES
// ==========================================
app.use('/api', routes);

// Base Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
// This must be placed after all routes and normal middlewares
app.use(errorHandler);

export default app;
