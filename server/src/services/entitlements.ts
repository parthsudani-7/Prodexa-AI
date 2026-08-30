import prisma from '../lib/prisma';

export interface PlanEntitlements {
  dailyAiPrompts: number;
  maxDocuments: number;
  maxMembers: number;
  storageMb: number;
  monthlyReports: number;
  monthlyCodeAudits: number;
  customAiKeys: boolean;
  sprintAutopilot: boolean;
  auditLogs: boolean;
  slackAlerts: boolean;
  sso: boolean;
}

export const PLAN_LIMITS: Record<string, PlanEntitlements> = {
  FREE: {
    dailyAiPrompts: 20,
    maxDocuments: 5,
    maxMembers: 3,
    storageMb: 100,
    monthlyReports: 5,
    monthlyCodeAudits: 10,
    customAiKeys: false,
    sprintAutopilot: false,
    auditLogs: false,
    slackAlerts: false,
    sso: false,
  },
  PRO: {
    dailyAiPrompts: 1000,
    maxDocuments: 100,
    maxMembers: 20,
    storageMb: 5000,
    monthlyReports: 50,
    monthlyCodeAudits: 200,
    customAiKeys: true,
    sprintAutopilot: true,
    auditLogs: true,
    slackAlerts: false,
    sso: false,
  },
  ENTERPRISE: {
    dailyAiPrompts: 100000,
    maxDocuments: 10000,
    maxMembers: 500,
    storageMb: 50000,
    monthlyReports: 1000,
    monthlyCodeAudits: 10000,
    customAiKeys: true,
    sprintAutopilot: true,
    auditLogs: true,
    slackAlerts: true,
    sso: true,
  },
};

export function getPlanEntitlements(plan: string = 'FREE'): PlanEntitlements {
  return PLAN_LIMITS[plan.toUpperCase()] || PLAN_LIMITS.FREE;
}

export async function checkOrgEntitlement(
  organizationId: string,
  feature: keyof PlanEntitlements
): Promise<{ allowed: boolean; plan: string; limit: any; current?: number; reason?: string }> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        _count: {
          select: {
            documents: true,
            memberships: true,
            reports: true,
          }
        }
      }
    });

    const plan = (org?.plan || 'FREE').toUpperCase();
    const entitlements = getPlanEntitlements(plan);

    if (feature === 'maxDocuments') {
      const current = org?._count.documents || 0;
      const limit = entitlements.maxDocuments;
      if (current >= limit) {
        return {
          allowed: false,
          plan,
          limit,
          current,
          reason: `Document quota reached (${current}/${limit}). Upgrade plan for higher capacity.`
        };
      }
      return { allowed: true, plan, limit, current };
    }

    if (feature === 'maxMembers') {
      const current = org?._count.memberships || 0;
      const limit = entitlements.maxMembers;
      if (current >= limit) {
        return {
          allowed: false,
          plan,
          limit,
          current,
          reason: `Team seat limit reached (${current}/${limit}). Upgrade plan to invite more teammates.`
        };
      }
      return { allowed: true, plan, limit, current };
    }

    if (feature === 'dailyAiPrompts') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usageToday = await prisma.tokenUsage.count({
        where: {
          organizationId,
          timestamp: { gte: today },
          feature: 'chat'
        }
      });

      const limit = entitlements.dailyAiPrompts;
      if (usageToday >= limit) {
        return {
          allowed: false,
          plan,
          limit,
          current: usageToday,
          reason: `Daily AI Prompt quota exceeded (${usageToday}/${limit}). Upgrade to Pro for unlimited prompts.`
        };
      }
      return { allowed: true, plan, limit, current: usageToday };
    }

    // Boolean feature checks
    const isAllowed = Boolean(entitlements[feature]);
    return {
      allowed: isAllowed,
      plan,
      limit: isAllowed,
      reason: isAllowed ? undefined : `Feature "${String(feature)}" requires a plan upgrade.`
    };
  } catch (err: any) {
    console.error('[Entitlement Check Error]', err.message);
    // Graceful open in case of check error
    return { allowed: true, plan: 'FREE', limit: 100 };
  }
}
