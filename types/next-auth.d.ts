import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles: string[];
      permissions: string[];
      status: string;
      emailVerifiedAt: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    roles: string[];
    permissions: string[];
    status: string;
    emailVerifiedAt: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: string[];
    permissions: string[];
    status: string;
    emailVerifiedAt: string | null;
  }
}
