import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      isNational: boolean;
      constituencyIds: string[];
    } & DefaultSession["user"];
  }

  interface User {
    roles: string[];
    isNational: boolean;
    constituencyIds: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    roles?: string[];
    isNational?: boolean;
    constituencyIds?: string[];
  }
}
