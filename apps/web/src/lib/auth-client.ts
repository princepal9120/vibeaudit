import { createAuthClient } from 'better-auth/react';
// import { organizationClient } from 'better-auth/client/plugins';
// import { twoFactorClient } from 'better-auth/client/plugins';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const authClient = createAuthClient({
  baseURL: API_URL,
  // Plugins disabled - uncomment when backend schema is updated
  // plugins: [
  //   organizationClient(),
  //   twoFactorClient(),
  // ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  // Organization methods (disabled)
  // organization,
  // useActiveOrganization,
  // 2FA methods (disabled)
  // twoFactor,
} = authClient;
