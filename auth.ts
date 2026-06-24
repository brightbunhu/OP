import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { loginSchema } from '@/lib/auth/validators';

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Credentials({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { roles: true },
        });

        if (!user || !user.passwordHash || user.deletedAt || user.status !== 'ACTIVE') {
          return null;
        }

        const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);

        if (!isValidPassword || !user.emailVerified) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const roles = user.roles.map((role) => role.name);
        const permissions = user.roles.flatMap((role) => {
          if (Array.isArray(role.permissions)) {
            return role.permissions.filter((permission): permission is string => typeof permission === 'string');
          }

          return [];
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          roles,
          permissions: Array.from(new Set(permissions)),
          status: user.status,
          emailVerifiedAt: user.emailVerified.toISOString(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id ?? token.sub);
        token.roles = Array.isArray(user.roles) ? user.roles : [];
        token.permissions = Array.isArray(user.permissions) ? user.permissions : [];
        token.status = user.status;
        token.emailVerifiedAt = user.emailVerifiedAt;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = String(token.id);
      session.user.roles = Array.isArray(token.roles) ? token.roles : [];
      session.user.permissions = Array.isArray(token.permissions) ? token.permissions : [];
      session.user.status = typeof token.status === 'string' ? token.status : 'ACTIVE';
      session.user.emailVerifiedAt = typeof token.emailVerifiedAt === 'string' ? token.emailVerifiedAt : null;

      return session;
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
