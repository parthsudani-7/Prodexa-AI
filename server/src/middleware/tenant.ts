import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

declare module 'express-serve-static-core' {
  interface Request {
    organizationId?: string;
    orgRole?: string;
  }
}

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.jwtUser?.userId;
  if (!userId) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required for multi-tenant context',
        requestId: req.requestId
      }
    });
    return;
  }

  try {
    const requestedOrgId = req.headers['x-organization-id'] as string | undefined;

    // 1. If explicit org ID is provided in headers, verify membership
    if (requestedOrgId) {
      const membership = await prisma.organizationMembership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: requestedOrgId,
            userId
          }
        },
        include: { organization: true }
      });

      if (membership) {
        req.organizationId = membership.organizationId;
        req.orgRole = membership.role;
        res.setHeader('X-Organization-Id', membership.organizationId);
        next();
        return;
      }
    }

    // 2. Otherwise find the user's default or first active membership
    let membership = await prisma.organizationMembership.findFirst({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: 'asc' }
    });

    // 3. If user has no workspace yet, auto-provision their personal workspace
    if (!membership) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const orgName = user?.name ? `${user.name.split(' ')[0]}'s Workspace` : 'My Workspace';
      const orgSlug = `${(user?.name || 'workspace').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${userId.substring(0, 6)}`;

      const newOrg = await prisma.organization.create({
        data: {
          name: orgName,
          slug: orgSlug,
          plan: user?.plan || 'FREE',
          memberships: {
            create: {
              userId,
              role: 'OWNER'
            }
          }
        }
      });

      await prisma.user.update({
        where: { id: userId },
        data: { defaultOrgId: newOrg.id }
      });

      req.organizationId = newOrg.id;
      req.orgRole = 'OWNER';
      res.setHeader('X-Organization-Id', newOrg.id);
      next();
      return;
    }

    req.organizationId = membership.organizationId;
    req.orgRole = membership.role;
    res.setHeader('X-Organization-Id', membership.organizationId);
    next();
  } catch (err: any) {
    console.warn('⚠️ [Tenant Notice] Database unreachable; assigning default workspace context:', err.message);
    const fallbackOrgId = (req.headers['x-organization-id'] as string) || 'org_primary_workspace';
    req.organizationId = fallbackOrgId;
    req.orgRole = req.jwtUser?.role || 'OWNER';
    res.setHeader('X-Organization-Id', fallbackOrgId);
    next();
  }
};
