import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "crypto";
import db from "@/lib/db";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_please_change_in_env"
);

/**
 * Generates a 6-digit verification code for email verification and stores it in the database.
 */
export const generateVerificationToken = async (email: string) => {
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expires in 1 hour from now
  
  // Generate a cryptographically secure random 6-digit code
  const buffer = randomBytes(4);
  const code = (buffer.readUInt32BE(0) % 900000 + 100000).toString();
  const token = code;

  const existingToken = await db.verificationToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await db.verificationToken.delete({
      where: { id: existingToken.id },
    });
  }

  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verificationToken;
};

/**
 * Generates a password reset JWT and stores it in the database.
 */
export const generatePasswordResetToken = async (email: string) => {
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  // Create JWT
  const token = await new SignJWT({ email, type: 'password_reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  const existingToken = await db.passwordResetToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};

/**
 * Verifies a JWT token (optional helper for extra security)
 */
export const verifyJWTToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (_error) {
    return null;
  }
};
