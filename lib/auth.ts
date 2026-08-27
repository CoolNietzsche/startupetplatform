import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { recordFailedLoginAttempt } from "@/lib/auth/security-hardening";

// How often an existing JWT is re-checked against the DB for role changes,
// suspension, or session revocation. Keeps a suspended/demoted account from
// staying privileged for the full 3-day token lifetime.
const SESSION_REVALIDATE_INTERVAL_MS = 60 * 1000;

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 3 * 24 * 60 * 60, // 3 days
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error("Email and password required");
                    }

                    // 1. Apply Rate Limiting: Max 5 attempts per 15 minutes per email
                    const { success } = await rateLimit(`login:${credentials.email}`, 5, 900);
                    if (!success) {
                        throw new Error("Too many failed login attempts. Please try again in 15 minutes.");
                    }

                    const user = await db.user.findUnique({
                        where: { email: credentials.email },
                        include: {
                            roles: {
                                include: {
                                    permissions: true
                                }
                            }
                        }
                    });

                    if (!user || !user.password) {
                        throw new Error("Invalid email or password");
                    }

                    // Block suspended users immediately
                    if (user.isSuspended) {
                        throw new Error("Your account has been suspended. Please contact the administrator.");
                    }

                    // Block accounts locked out from repeated failed attempts
                    if (user.lockedUntil && user.lockedUntil > new Date()) {
                        throw new Error("Account temporarily locked due to too many failed login attempts. Please try again later.");
                    }

                    if (!user.emailVerified && user.role !== 'SUPER_ADMIN') {
                        throw new Error("Email not verified. Please check your inbox.");
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        await recordFailedLoginAttempt(user.email);
                        throw new Error("Invalid email or password");
                    }

                    // Clear any prior failed-attempt state on a successful login
                    if (user.loginAttempts > 0 || user.lockedUntil) {
                        await db.user.update({
                            where: { id: user.id },
                            data: { loginAttempts: 0, lockedUntil: null },
                        });
                    }

                    // Flatten permissions from all roles
                    const permissionCodes = Array.from(new Set(
                        user.roles.flatMap(role => role.permissions.map(p => p.code))
                    ));

                    return {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        name: `${user.firstName} ${user.lastName}`,
                        role: user.role,
                        stakeholderId: user.stakeholderId,
                        permissions: permissionCodes,
                        address: user.address,
                        phoneNumber: user.phoneNumber,
                        image: user.image,
                        twoStepAuthEnabled: user.twoStepAuthEnabled
                    } as any;
                } catch (error: any) {
                    // Gracefully pass the error string to NextAuth so it creates the client toast,
                    // bypassing the manual console.error stack trace dump for validation issues.
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.stakeholderId = user.stakeholderId;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token.permissions = user.permissions;
                token.address = user.address;
                token.phoneNumber = user.phoneNumber;
                token.image = user.image;
                token.twoStepAuthEnabled = user.twoStepAuthEnabled;
                token.revoked = false;
                token.lastVerified = Date.now();

                // Track this login as an active session so it can be listed/
                // terminated later (see app/api/auth/sessions).
                token.sessionToken = crypto.randomUUID();
                try {
                    await db.userSession.create({
                        data: {
                            userId: user.id,
                            token: token.sessionToken,
                            isActive: true,
                        },
                    });
                } catch (err) {
                    console.error("Failed to record user session:", err);
                }

                return token;
            }

            if (trigger === "update" && session) {
                if (session.firstName) token.firstName = session.firstName;
                if (session.lastName) token.lastName = session.lastName;
                if (session.phoneNumber) token.phoneNumber = session.phoneNumber;
                if (session.address !== undefined) token.address = session.address;
                if (session.image !== undefined) token.image = session.image;
            }

            // Periodically re-validate against the DB so a suspension, role
            // change, or explicit session termination takes effect quickly
            // instead of waiting out the full token lifetime.
            const isStale =
                !token.lastVerified ||
                Date.now() - token.lastVerified > SESSION_REVALIDATE_INTERVAL_MS;

            if (isStale && token.id) {
                const [dbUser, userSession] = await Promise.all([
                    db.user.findUnique({
                        where: { id: token.id },
                        select: { role: true, isSuspended: true, deletedAt: true },
                    }),
                    token.sessionToken
                        ? db.userSession.findUnique({
                              where: { token: token.sessionToken },
                              select: { isActive: true },
                          })
                        : Promise.resolve(null),
                ]);

                const sessionWasTerminated = Boolean(
                    token.sessionToken && userSession && !userSession.isActive,
                );

                if (!dbUser || dbUser.deletedAt || dbUser.isSuspended || sessionWasTerminated) {
                    token.revoked = true;
                } else {
                    token.role = dbUser.role;
                    token.revoked = false;
                }
                token.lastVerified = Date.now();
            }

            return token;
        },
        async signIn({ user }) {
          if (user) {
            const { createAuditLog } = await import("@/lib/audit");
            await createAuditLog({
              userId: user.id,
              email: user.email || undefined,
              action: "USER_LOGIN",
              resource: "auth",
            });
          }
          return true;
        },
        async session({ session, token }: any) {
            if (token?.revoked) {
                // Suspended, deleted, or explicitly terminated — don't hand
                // back an authenticated session for this token.
                return { ...session, user: undefined };
            }
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.stakeholderId = token.stakeholderId;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.permissions = token.permissions;
                session.user.address = token.address;
                session.user.phoneNumber = token.phoneNumber;
                session.user.image = token.image;
                session.user.twoStepAuthEnabled = token.twoStepAuthEnabled;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
    pages: {
        signIn: '/auth/sign-in',
        error: '/auth/error',
    }
};

export default NextAuth(authOptions);
