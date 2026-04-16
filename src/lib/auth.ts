import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { authConfig } from "./auth.config";
import { audit } from "./audit-log";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),
  providers: [
    // OAuth providers removed — credentials-only for now.
    // Re-add Google/GitHub when provider keys are configured.
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;

        if (!email || !credentials?.password) {
          // Audit as failure with no user — helps spot credential-stuffing
          // probes that send malformed payloads.
          audit({
            action: "auth.login.failure",
            result: "failure",
            metadata: { reason: "missing_credentials" },
          });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          audit({
            action: "auth.login.failure",
            result: "failure",
            metadata: { reason: "user_not_found", emailTried: email },
          });
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          audit({
            action: "auth.login.failure",
            userId: user.id,
            result: "failure",
            metadata: { reason: "bad_password" },
          });
          return null;
        }

        audit({
          action: "auth.login.success",
          userId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  events: {
    async signOut(message) {
      // NextAuth's SignOut event passes either a token (JWT strategy) or
      // a session (database strategy). Both may omit the user id on
      // session-expiry, which is why we narrow defensively.
      let userId: string | undefined;
      if ("token" in message && message.token && "sub" in message.token) {
        userId = message.token.sub as string | undefined;
      } else if ("session" in message && message.session && "userId" in message.session) {
        userId = message.session.userId as string | undefined;
      }
      audit({ action: "auth.logout", userId: userId ?? null });
    },
  },
});
