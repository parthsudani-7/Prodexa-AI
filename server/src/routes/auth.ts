import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { logAuditEvent } from '../services/audit';

const router = Router();

function getFrontendOrigin(req: Request): string {
  // 1. Client Origin header
  const originHeader = req.headers.origin as string;
  if (originHeader && !originHeader.includes('google.com') && !originHeader.includes('your-frontend')) {
    return originHeader.replace(/\/$/, '');
  }

  // 2. Referer header (must not be Google)
  const referer = req.headers.referer;
  if (referer) {
    try {
      const parsed = new URL(referer).origin;
      if (!parsed.includes('google.com') && !parsed.includes('your-frontend')) {
        return parsed.replace(/\/$/, '');
      }
    } catch {}
  }

  // 3. Environment variable
  const clientEnv = process.env.CLIENT_URL;
  if (clientEnv && !clientEnv.includes('your-frontend') && !clientEnv.includes('google.com')) {
    return clientEnv.replace(/\/$/, '');
  }

  // 4. Default
  return 'https://prodexa-ai-client.vercel.app';
}

// Configure Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
      callbackURL: '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || 'Google User';
        const avatar = profile.photos?.[0]?.value || '';
        const googleId = profile.id;

        if (!email) return done(new Error('No email returned from Google authentication'), undefined);

        let user: any = null;
        try {
          user = await prisma.user.findUnique({
            where: { email },
            include: { memberships: { include: { organization: true } } }
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                googleId,
                name,
                email,
                avatar,
                role: 'ADMIN',
                plan: 'PRO',
                dailyQuota: 1000,
              },
              include: { memberships: { include: { organization: true } } }
            });

            const orgSlug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${user.id.substring(0, 6)}`;
            const org = await prisma.organization.create({
              data: {
                name: `${name.split(' ')[0]}'s Workspace`,
                slug: orgSlug,
                plan: 'PRO',
                memberships: {
                  create: {
                    userId: user.id,
                    role: 'OWNER',
                  }
                }
              }
            });

            await prisma.user.update({
              where: { id: user.id },
              data: { defaultOrgId: org.id }
            });
          }
        } catch (dbErr: any) {
          console.warn('⚠️ [Database Notice] Remote DB unreachable; using graceful session fallback:', dbErr.message);
          user = {
            id: googleId || `usr_${Date.now()}`,
            name,
            email,
            avatar,
            role: 'ADMIN',
            plan: 'PRO',
            defaultOrgId: 'org_primary_workspace',
          };
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

// Initiate Real Google OAuth (Always prompts Google account picker)
router.get('/google', (req: Request, res: Response, next) => {
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    prompt: 'select_account',
    session: false 
  })(req, res, next);
});

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.CLIENT_URL || 'https://prodexa-ai-client.vercel.app'}?auth=failed` 
  }),
  async (req: Request, res: Response) => {
    const user = req.user as any;
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    if (user.defaultOrgId) {
      await logAuditEvent({
        organizationId: user.defaultOrgId,
        actorId: user.id,
        action: 'USER_LOGIN',
        resourceType: 'SECURITY',
        resourceId: user.id,
        metadata: { method: 'GOOGLE_OAUTH' },
        req,
      });
    }

    const clientUrl = getFrontendOrigin(req);
    res.redirect(`${clientUrl}/auth/callback?token=${token}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar || '')}&email=${encodeURIComponent(user.email)}&plan=${user.plan}`);
  }
);

// Verify token endpoint & return complete user profile with workspaces
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'NO_TOKEN', message: 'No authorization token provided', requestId: req.requestId } });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          memberships: {
            include: {
              organization: true
            }
          }
        }
      });

      if (user) {
        res.json({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            plan: user.plan,
            dailyQuota: user.dailyQuota,
            defaultOrgId: user.defaultOrgId,
            workspaces: (user.memberships || []).map((m) => ({
              id: m.organization.id,
              name: m.organization.name,
              slug: m.organization.slug,
              plan: m.organization.plan,
              role: m.role,
            }))
          }
        });
        return;
      }
    } catch (dbErr: any) {
      console.warn('⚠️ [Database Notice] Remote DB unreachable in /me; returning session profile:', dbErr.message);
    }

    // Return authenticated session user
    res.json({
      data: {
        id: decoded.userId,
        name: decoded.name || decoded.email?.split('@')[0] || 'User',
        email: decoded.email,
        avatar: '',
        role: decoded.role || 'ADMIN',
        plan: decoded.plan || 'PRO',
        dailyQuota: 1000,
        defaultOrgId: 'org_primary_workspace',
        workspaces: [
          {
            id: 'org_primary_workspace',
            name: 'Primary Workspace',
            slug: 'primary-workspace',
            plan: decoded.plan || 'PRO',
            role: decoded.role || 'OWNER',
          }
        ]
      }
    });
  } catch (err: any) {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token', requestId: req.requestId } });
  }
});

// POST /api/auth/demo — Generic Demo Login or Custom User Registration
router.post('/demo', async (req: Request, res: Response) => {
  const { email = 'demo.user@prodexa.ai', name = 'Demo User' } = req.body;

  try {
    let user: any = await prisma.user.findUnique({
      where: { email },
      include: { memberships: { include: { organization: true } } }
    }).catch(() => null);

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            name,
            email,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
            role: 'ADMIN',
            plan: 'PRO',
            dailyQuota: 1000,
          },
          include: { memberships: { include: { organization: true } } }
        });

        const orgSlug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${user.id.substring(0, 6)}`;
        const org = await prisma.organization.create({
          data: {
            name: `${name.split(' ')[0]}'s Workspace`,
            slug: orgSlug,
            plan: 'PRO',
            memberships: {
              create: {
                userId: user.id,
                role: 'OWNER',
              }
            }
          }
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { defaultOrgId: org.id }
        });
      } catch {
        user = {
          id: `usr_${Date.now()}`,
          name,
          email,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          role: 'ADMIN',
          plan: 'PRO',
          defaultOrgId: 'org_primary_workspace',
        };
      }
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        defaultOrgId: user.defaultOrgId || 'org_primary_workspace'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'DEMO_LOGIN_FAILED', message: err.message, requestId: req.requestId } });
  }
});

export default router;
