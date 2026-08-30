import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import { requireRole } from '../middleware/rbac';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/audit-logs — Query workspace audit logs (Admin/Owner only)
router.get('/', authMiddleware, tenantMiddleware, requireRole(['OWNER', 'ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const { action, resourceType, page = '1', limit = '50' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
  const skip = (pageNum - 1) * take;

  try {
    const where: any = { organizationId };
    if (action) where.action = String(action);
    if (resourceType) where.resourceType = String(resourceType);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      data: logs,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_AUDIT_LOGS_FAILED', message: err.message, requestId: req.requestId } });
  }
});

export default router;
