import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { NATIONAL_ROLE_KEYS } from "@/lib/roles";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 hour session timeout
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            roles: { include: { role: true } },
            constituencyAccess: { select: { constituencyId: true } },
          },
        });
        if (!user || !user.active) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        const roleKeys = user.roles.map((r) => r.role.key);
        const isNational = roleKeys.some((k) => NATIONAL_ROLE_KEYS.includes(k as never));

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: roleKeys,
          isNational,
          constituencyIds: user.constituencyAccess.map((c) => c.constituencyId),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.roles = (user as { roles: string[] }).roles;
        token.isNational = (user as { isNational: boolean }).isNational;
        token.constituencyIds = (user as { constituencyIds: string[] }).constituencyIds;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.roles = (token.roles as string[]) ?? [];
        session.user.isNational = (token.isNational as boolean) ?? false;
        session.user.constituencyIds = (token.constituencyIds as string[]) ?? [];
      }
      return session;
    },
  },
});
