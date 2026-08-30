import { Request, Response, NextFunction } from 'express';

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req.orgRole || req.jwtUser?.role || 'EMPLOYEE').toUpperCase() as Role;

    // OWNER has all permissions
    if (userRole === 'OWNER') {
      next();
      return;
    }

    if (allowedRoles.includes(userRole)) {
      next();
      return;
    }

    res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: `Insufficient permissions. Requires one of: ${allowedRoles.join(', ')}`,
        requestId: req.requestId
      }
    });
  };
};
