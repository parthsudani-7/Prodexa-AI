import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import { generateMeetingSummary } from '../services/gemini';
import { logAuditEvent } from '../services/audit';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/meetings — list meetings in workspace
router.get('/', authMiddleware, tenantMiddleware, async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  try {
    const meetings = await prisma.meeting.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(meetings);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_MEETINGS_FAILED', message: err.message, requestId: req.requestId } });
  }
});

// POST /api/meetings/summarize — process transcript & store meeting
router.post('/summarize', authMiddleware, tenantMiddleware, async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const userId = req.jwtUser!.userId;
  const { title = 'Meeting Sync', transcript, duration = '30 mins' } = req.body;

  if (!transcript) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Transcript content is required', requestId: req.requestId } });
    return;
  }

  try {
    const summaryData = await generateMeetingSummary(transcript, { organizationId, userId });

    const meeting = await prisma.meeting.create({
      data: {
        organizationId,
        title,
        date: new Date().toISOString().split('T')[0],
        duration,
        summary: summaryData.summary,
        actions: summaryData.actions,
        blockers: summaryData.blockers,
        decisions: summaryData.decisions,
      }
    });

    await logAuditEvent({
      organizationId,
      actorId: userId,
      action: 'MEETING_SUMMARIZED',
      resourceType: 'MEETING',
      resourceId: meeting.id,
      metadata: { title, actionItemsCount: summaryData.actions.length },
      req,
    });

    res.status(201).json(meeting);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SUMMARIZE_FAILED', message: err.message, requestId: req.requestId } });
  }
});

export default router;
