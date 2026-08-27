import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: string; // Or your specific Role enum
      permissions?: string[];
      firstName?: string;
      lastName?: string;
      address?: string | null;
      phoneNumber?: string | null;
      image?: string | null;
      twoStepAuthEnabled?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    permissions?: string[];
    firstName: string;
    lastName: string;
    address?: string | null;
    phoneNumber?: string | null;
    image?: string | null;
    twoStepAuthEnabled?: boolean;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    role: string;
    permissions?: string[];
    firstName?: string;
    lastName?: string;
    address?: string | null;
    phoneNumber?: string | null;
    image?: string | null;
    twoStepAuthEnabled?: boolean;
    sessionToken?: string;
    lastVerified?: number;
    revoked?: boolean;
  }
}
