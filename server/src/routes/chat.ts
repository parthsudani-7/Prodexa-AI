import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import { checkOrgEntitlement } from '../services/entitlements';
import { aiGateway } from '../services/ai/aiGateway';
import { logAuditEvent } from '../services/audit';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/chat/history — get chat sessions for active workspace
router.get('/history', authMiddleware, tenantMiddleware, async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const userId = req.jwtUser!.userId;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        organizationId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(chats);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_CHATS_FAILED', message: err.message, requestId: req.requestId } });
  }
});

// POST /api/chat — send prompt with RAG retrieval and persona support
router.post('/', authMiddleware, tenantMiddleware, async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const userId = req.jwtUser!.userId;
  const { message, persona = 'general', chatId, model = 'gemini-1.5-flash' } = req.body;

  if (!message || !message.trim()) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Message content is required', requestId: req.requestId } });
    return;
  }

  try {
    // 1. Enforce Daily AI Prompts Quota
    const quotaCheck = await checkOrgEntitlement(organizationId, 'dailyAiPrompts');
    if (!quotaCheck.allowed) {
      res.status(403).json({
        error: {
          code: 'PROMPT_QUOTA_EXCEEDED',
          message: quotaCheck.reason,
          requestId: req.requestId,
        }
      });
      return;
    }

    // 2. Perform RAG vector search in active organization
    let contextText = '';
    const citations: string[] = [];

    try {
      const docs = await prisma.document.findMany({
        where: { organizationId, status: 'READY' },
        include: { embeddings: true },
        take: 5,
      });

      for (const doc of docs) {
        if (doc.embeddings && doc.embeddings.length > 0) {
          const sampleChunk = doc.embeddings[0].chunkText;
          if (sampleChunk) {
            contextText += `\n[Doc: ${doc.name}]: ${sampleChunk.substring(0, 400)}`;
            citations.push(doc.name);
          }
        }
      }
    } catch (ragErr) {
      console.warn('⚠️ [RAG Warning] Document retrieval skipped:', ragErr);
    }

    // 3. Generate response via AI Gateway
    const aiResult = await aiGateway.generateText({
      prompt: message,
      context: contextText || undefined,
      persona,
      model,
      organizationId,
      userId,
      feature: 'chat',
    });

    // 4. Persist or attach to Chat session
    let activeChatId = chatId;
    if (!activeChatId) {
      const newChat = await prisma.chat.create({
        data: {
          organizationId,
          userId,
          title: message.length > 30 ? `${message.substring(0, 30)}...` : message,
          persona,
        }
      });
      activeChatId = newChat.id;
    }

    // Save user message
    await prisma.message.create({
      data: {
        chatId: activeChatId,
        sender: 'USER',
        text: message,
      }
    });

    // Save assistant message
    const assistantMsg = await prisma.message.create({
      data: {
        chatId: activeChatId,
        sender: 'ASSISTANT',
        text: aiResult.text,
        citations: citations.slice(0, 3),
      }
    });

    res.json({
      chatId: activeChatId,
      reply: aiResult.text,
      citations: citations.slice(0, 3),
      message: assistantMsg,
      meta: {
        tokens: aiResult.inputTokens + aiResult.outputTokens,
        cost: aiResult.cost,
        latency: aiResult.latency,
        isFallback: aiResult.isFallback,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'CHAT_FAILED', message: err.message, requestId: req.requestId } });
  }
});

// DELETE /api/chat/:id — delete a chat session
router.delete('/:id', authMiddleware, tenantMiddleware, async (req: Request, res: Response) => {
  const organizationId = req.organizationId!;
  const { id } = req.params;

  try {
    await prisma.chat.deleteMany({
      where: { id, organizationId }
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'DELETE_CHAT_FAILED', message: err.message, requestId: req.requestId } });
  }
});

export default router;
