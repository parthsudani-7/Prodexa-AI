import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import { generateReport } from '../services/gemini';
import { logAuditEvent } from '../services/audit';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/reports — list reports in active workspace
router.get('/', authMiddleware, tenantMiddleware, async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  try {
    const reports = await prisma.report.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_REPORTS_FAILED', message: err.message, requestId: req.requestId } });
  }
});

// POST /api/reports/generate — generate report
router.post('/generate', authMiddleware, tenantMiddleware, async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const userId = req.jwtUser!.userId;
  const { type = 'WEEKLY', scope = 'Engineering & Product' } = req.body;

  try {
    const [tasks, tokenUsage, meetings] = await Promise.all([
      prisma.task.findMany({ where: { organizationId } }),
      prisma.tokenUsage.findMany({ where: { organizationId }, take: 50 }),
      prisma.meeting.findMany({ where: { organizationId }, take: 10 }),
    ]);

    const reportData = await generateReport({ type, tasks, tokenUsage, meetings }, { organizationId, userId });

    const report = await prisma.report.create({
      data: {
        organizationId,
        userId,
        type,
        date: new Date().toISOString().split('T')[0],
        scope,
        summary: reportData.summary,
        insights: reportData.insights,
        risks: reportData.risks,
        recommendations: reportData.recommendations,
      }
    });

    await logAuditEvent({
      organizationId,
      actorId: userId,
      action: 'REPORT_GENERATED',
      resourceType: 'REPORT',
      resourceId: report.id,
      metadata: { type, scope },
      req,
    });

    res.status(201).json(report);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'GENERATE_REPORT_FAILED', message: err.message, requestId: req.requestId } });
  }
});

export default router;
