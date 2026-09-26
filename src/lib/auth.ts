import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { twoFactor } from 'better-auth/plugins';
import { createAuthMiddleware } from 'better-auth/api';
import { db } from '../db';
import { user, session, account, verification, twoFactor as twoFactorTable } from '../db/schema';

export const auth = betterAuth({
  appName: 'Wahyu Andika Putra | Admin',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification, twoFactor: twoFactorTable },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
  },
  plugins: [twoFactor()],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/change-password') {
        if (ctx.body && typeof ctx.body === 'object') {
          (ctx.body as Record<string, unknown>).revokeOtherSessions = true;
        }
      }
    }),
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/two-factor/verify-totp': { window: 60, max: 5 },
    },
  },
  secret: import.meta.env.BETTER_AUTH_SECRET,
  baseURL: import.meta.env.BETTER_AUTH_URL,
});
