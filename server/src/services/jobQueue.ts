import crypto from 'crypto';
import { tenantStorage } from '../lib/prisma';

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface BackgroundJob<T = any> {
  id: string;
  queue: 'rag-embedding-queue' | 'code-audit-queue' | 'transcript-synthesis-queue' | 'scheduled-analytics-queue' | string;
  type: string;
  organizationId?: string;
  userId?: string;
  data: T;
  status: JobStatus;
  progress: number;
  attempts: number;
  maxAttempts: number;
  error?: string;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

class JobQueue {
  private jobs: Map<string, BackgroundJob> = new Map();
  private isProcessing: boolean = false;
  private handlers: Map<string, (job: BackgroundJob) => Promise<any>> = new Map();

  constructor() {
    setInterval(() => {
      const oneHourAgo = Date.now() - 3600000;
      for (const [id, job] of this.jobs.entries()) {
        if ((job.status === 'COMPLETED' || job.status === 'FAILED') && job.updatedAt.getTime() < oneHourAgo) {
          this.jobs.delete(id);
        }
      }
    }, 600000);
  }

  public registerHandler(type: string, handler: (job: BackgroundJob) => Promise<any>): void {
    this.handlers.set(type, handler);
  }

  public enqueue<T>(
    type: string, 
    data: T, 
    meta?: { 
      organizationId?: string; 
      userId?: string; 
      maxAttempts?: number;
      queue?: 'rag-embedding-queue' | 'code-audit-queue' | 'transcript-synthesis-queue' | 'scheduled-analytics-queue';
    }
  ): BackgroundJob<T> {
    const job: BackgroundJob<T> = {
      id: `job_${crypto.randomUUID()}`,
      queue: meta?.queue || 'rag-embedding-queue',
      type,
      organizationId: meta?.organizationId,
      userId: meta?.userId,
      data,
      status: 'QUEUED',
      progress: 0,
      attempts: 0,
      maxAttempts: meta?.maxAttempts || 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(job.id, job);
    console.log(`📥 [JOB QUEUE:${job.queue}] Enqueued job ${job.id} (Type: ${type}, Org: ${meta?.organizationId || 'N/A'})`);

    setImmediate(() => this.processNext());
    return job;
  }

  public getJob(id: string): BackgroundJob | undefined {
    return this.jobs.get(id);
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const nextJob = Array.from(this.jobs.values()).find((j) => j.status === 'QUEUED');
      if (!nextJob) {
        this.isProcessing = false;
        return;
      }

      const handler = this.handlers.get(nextJob.type);
      if (!handler) {
        nextJob.status = 'FAILED';
        nextJob.error = `No worker handler registered for job type: ${nextJob.type}`;
        nextJob.updatedAt = new Date();
        this.isProcessing = false;
        setImmediate(() => this.processNext());
        return;
      }

      nextJob.status = 'PROCESSING';
      nextJob.attempts++;
      nextJob.updatedAt = new Date();

      try {
        // Run job inside tenant context storage to enforce PostgreSQL RLS scoping
        let result: any = null;
        if (nextJob.organizationId) {
          result = await tenantStorage.run(
            { tenantId: nextJob.organizationId, userId: nextJob.userId },
            async () => handler(nextJob)
          );
        } else {
          result = await handler(nextJob);
        }

        nextJob.status = 'COMPLETED';
        nextJob.progress = 100;
        nextJob.result = result;
        nextJob.updatedAt = new Date();
        console.log(`✅ [JOB QUEUE] Job ${nextJob.id} (${nextJob.type}) finished successfully.`);
      } catch (err: any) {
        console.error(`❌ [JOB QUEUE] Error in job ${nextJob.id}:`, err.message);
        if (nextJob.attempts < nextJob.maxAttempts) {
          nextJob.status = 'QUEUED'; // Retry
        } else {
          nextJob.status = 'FAILED';
          nextJob.error = err.message;
        }
        nextJob.updatedAt = new Date();
      }

      this.isProcessing = false;
      setImmediate(() => this.processNext());
    } catch (queueErr: any) {
      console.error('Queue processing loop error:', queueErr);
      this.isProcessing = false;
    }
  }
}

export const jobQueue = new JobQueue();
export default jobQueue;
