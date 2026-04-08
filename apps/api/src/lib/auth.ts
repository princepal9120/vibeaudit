import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
// import { organization } from 'better-auth/plugins/organization';
// import { twoFactor } from 'better-auth/plugins/two-factor';
import { prisma } from '../db.js';
import { config } from '../config.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // baseURL should be the API URL where auth endpoints are served
  baseURL: config.betterAuthUrl,
  basePath: '/api/auth',

  // trustedOrigins allows the frontend to make requests
  trustedOrigins: config.frontendUrl,

  secret: config.jwtSecret,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  socialProviders: {
    github: {
      clientId: config.githubClientId,
      clientSecret: config.githubClientSecret,
    },
    google: {
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  advanced: {
    // Cross-origin cookie settings for development
    crossSubDomainCookies: {
      enabled: false, // Not needed for localhost
    },
    defaultCookieAttributes: {
      sameSite: 'none', // Required for cross-site OAuth redirects (local to production)
      secure: true, // Required for sameSite: 'none' (Railway provides HTTPS)
      httpOnly: true,
      path: '/',
    },
  },

  user: {
    additionalFields: {
      // No additional fields needed - using standard better-auth fields
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['github', 'google'],
    },
  },

  // Plugins disabled until database schema is updated
  // To enable: Add organization and twoFactor tables to schema.prisma
  // and run: npx prisma db push
  // plugins: [
  //   organization({
  //     allowUserToCreateOrganization: true,
  //   }),
  //   twoFactor({
  //     issuer: 'VibeAudit',
  //     otpOptions: {
  //       period: 30,
  //       digits: 6,
  //     },
  //   }),
  // ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
