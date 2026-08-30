import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/notifications — list notifications for authenticated user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const userId = req.jwtUser!.userId;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_NOTIFICATIONS_FAILED', message: err.message, requestId: req.requestId } });
  }
});

// PUT /api/notifications/:id/read — mark specific notification as read
router.put('/:id/read', authMiddleware, async (req: Request, res: Response) => {
  const userId = req.jwtUser!.userId;
  const { id } = req.params;

  try {
    const updated = await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true }
    });
    res.json({ success: true, updated });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'UPDATE_NOTIFICATION_FAILED', message: err.message, requestId: req.requestId } });
  }
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', authMiddleware, async (req: Request, res: Response) => {
  const userId = req.jwtUser!.userId;

  try {
    await prisma.notification.updateMany({
      where: { userId },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'MARK_ALL_READ_FAILED', message: err.message, requestId: req.requestId } });
  }
});

export default router;
