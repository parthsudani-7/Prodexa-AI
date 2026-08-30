import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import passport from 'passport';
import cookieSession from 'cookie-session';

dotenv.config();

import { requestIdMiddleware } from './middleware/requestId';
import { securityShieldMiddleware } from './middleware/securityShield';
import authRouter from './routes/auth';
import organizationsRouter from './routes/organizations';
import auditLogsRouter from './routes/auditLogs';
import billingRouter from './routes/billing';
import chatRouter from './routes/chat';
import documentsRouter from './routes/documents';
import tasksRouter from './routes/tasks';
import meetingsRouter from './routes/meetings';
import reportsRouter from './routes/reports';
import notificationsRouter from './routes/notifications';
import analyticsRouter from './routes/analytics';
import codeRouter from './routes/code';
import prisma from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable reverse proxy trust (Required for HTTPS on Render/Cloudflare)
app.set('trust proxy', 1);

// ─── Core Middleware ────────────────────────────────────────────────────────
app.use(requestIdMiddleware);
app.use(securityShieldMiddleware);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['X-Request-Id', 'X-Organization-Id'],
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.JWT_SECRET || 'secret'],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ─── Health, Liveness & Readiness Probes ────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'Prodexa AI — Enterprise Backend API',
    status: 'online',
    version: '2.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: '1.0.0',
    requestId: req.requestId,
  });
});

app.get('/api/live', (req, res) => {
  res.json({
    status: 'live',
    uptimeSeconds: Math.floor(process.uptime()),
    requestId: req.requestId,
  });
});

app.get('/api/ready', async (req, res) => {
  try {
    // Probe database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      database: 'connected',
      requestId: req.requestId,
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'degraded',
      database: 'unreachable',
      error: err.message,
      requestId: req.requestId,
    });
  }
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/chat', chatRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/code', codeRouter);

// ─── User Profile & Keys Routes ─────────────────────────────────────────────
app.get('/api/users/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No authorization token', requestId: req.requestId } });
    return;
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        memberships: {
          include: { organization: true }
        }
      }
    });
    if (!user) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found', requestId: req.requestId } });
      return;
    }
    res.json(user);
  } catch {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid token', requestId: req.requestId } });
  }
});

app.get('/api/users/keys', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No token', requestId: req.requestId } });
    return;
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret') as any;
    const keys = await prisma.aiToken.findUnique({
      where: { userId: decoded.userId },
    });
    res.json(keys || { geminiKey: '', openaiKey: '' });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message, requestId: req.requestId } });
  }
});

app.post('/api/users/keys', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No token', requestId: req.requestId } });
    return;
  }
  const { geminiKey, openaiKey } = req.body;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret') as any;
    const keys = await prisma.aiToken.upsert({
      where: { userId: decoded.userId },
      update: { geminiKey, openaiKey },
      create: { userId: decoded.userId, geminiKey, openaiKey },
    });
    res.json(keys);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message, requestId: req.requestId } });
  }
});

// ─── Standardized Global Error Handler ──────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`❌ [SERVER ERROR] (${req.requestId})`, err.stack || err.message);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      requestId: req.requestId,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }
  });
});

// ─── Server Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 [Prodexa AI Server] listening on http://localhost:${PORT}`);
  console.log(`   Health:        http://localhost:${PORT}/api/health`);
  console.log(`   Readiness:     http://localhost:${PORT}/api/ready\n`);
});