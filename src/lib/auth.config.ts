import type { NextAuthConfig } from "next-auth";

/**
 * Auth config shared between middleware (edge) and server.
 * MUST NOT import Prisma or any Node.js-only modules.
 */
export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    newUser: "/dashboard/organization",
  },
  providers: [], // Populated in auth.ts — middleware only needs JWT validation
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
