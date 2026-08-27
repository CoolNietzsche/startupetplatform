'use server'
import { signUpFormSchema, validateStrongPassword } from "@/lib/formSchema";
import db from "@/lib/db";
import { z } from "zod";
import { sendEmail } from "@/lib/actions/send-email";
import { generateVerificationToken, generatePasswordResetToken, verifyJWTToken } from "@/lib/token";
import bcrypt from "bcryptjs";
import { addPasswordToHistory, isPasswordReused } from "@/lib/auth/security-hardening";

/**
 * Automatically deletes users who haven't verified their email within 24 hours.
 */
export async function cleanupUnverifiedUsers() {
    const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 3600 * 1000);
    
    try {
        const deleted = await db.user.deleteMany({
            where: {
                emailVerified: null,
                createdAt: {
                    lt: twentyFourHoursAgo
                }
            }
        });
        return deleted.count;
    } catch (error) {
        console.error("Cleanup error:", error);
        return 0;
    }
}

export async function signUpAction(formData: z.infer<typeof signUpFormSchema>) {
    const result: any = {
        success: false,
        message: "",
        user: null
    }

    const parsed = signUpFormSchema.safeParse(formData);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message || "Invalid registration data.",
        };
    }
    formData = parsed.data;

    try {
        // Run cleanup occasionally during sign up
        // await cleanupUnverifiedUsers();

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email: formData.email }
        });

        if (existingUser) {
            return { success: false, message: "Email already in use." };
        }

        const normalizedPhone = formData.phoneNumber.replace(/[\s-]/g, "");
        const existingPhone = await db.user.findFirst({
            where: {
                phoneNumber: normalizedPhone,
            },
            select: { id: true },
        });

        if (existingPhone) {
            return { success: false, message: "Phone number already in use." };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(formData.password, 10);
        const userId = `user_${Date.now()}`;

        // Create user using Raw SQL to handle the schema transition safely
        await db.$executeRawUnsafe(`
            INSERT INTO "user"."User" ("id", "email", "firstName", "lastName", "phoneNumber", "password", "role", "onboardingCompleted", "twoStepAuthEnabled", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `, userId, formData.email, formData.firstName, formData.lastName, normalizedPhone, hashedPassword, formData.role, false, false);

        const user = { id: userId, email: formData.email };

        await addPasswordToHistory(userId, formData.password);

        // Generate and send verification token
        const verificationToken = await generateVerificationToken(user.email);
        
        const emailResult = await sendEmail({
            to: user.email,
            subject: "Verify your email address",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #16a34a; margin: 0;">Welcome to StartupET!</h2>
                    </div>
                    <p style="color: #333; font-size: 16px;">Thank you for signing up. Please use the following 6-digit code to verify your email address and activate your account:</p>
                    <div style="text-align: center; margin: 40px 0;">
                        <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #16a34a; padding: 20px 40px; border-radius: 10px;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #16a34a;">${verificationToken.token}</span>
                        </div>
                    </div>
                    <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in 1 hour. Your account data will be deleted if not verified within this timeframe.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <p style="color: #999; font-size: 12px; margin: 0;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                </div>
            `
        });

        if (!emailResult.success) {
            console.warn("Verification email failed to send:", emailResult.message);
            result.message = "Registration successful, but we couldn't send the verification email. Please check your inbox or contact support.";
        } else {
            result.message = "Registration successful! Please check your email for the 6-digit verification code.";
        }

        result.user = { id: user.id, email: user.email };
        result.success = true;
    } catch (err: any) {
        console.error("SignUp Error:", err);
        result.message = err.message || "Something went wrong during registration.";
    }

    return result;
}

/**
 * Handles password reset request
 */
export async function forgotPasswordAction(email: string) {
    try {
        const user = await db.user.findUnique({ where: { email } });
        if (!user) return { success: false, message: "No account found with that email address." };

        const resetToken = await generatePasswordResetToken(email);
        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken.token}`;

        const emailResult = await sendEmail({
            to: email,
            subject: "Reset your password",
            html: `
                 <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
            `
        });

        if (!emailResult.success) {
            if (process.env.NODE_ENV === "development") {
                return { success: true, message: `DEV MODE: Reset link: ${resetUrl}` };
            }
            return { success: false, message: emailResult.message || "Failed to send reset link. Please try again." };
        }

        return { success: true, message: "Reset link sent to your email." };
    } catch (error) {
        return { success: false, message: "Failed to send reset link." };
    }
}


/**
 * Verifies email using 6-digit code
 */
export async function verifyEmailAction(token: string) {
    try {
        const existingToken = await db.verificationToken.findUnique({
            where: { token }
        });

        if (!existingToken) {
            return { success: false, message: "Invalid or expired verification code." };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) {
            await db.verificationToken.deleteMany({ where: { id: existingToken.id } });
            return { success: false, message: "Verification code has expired." };
        }

        const existingUser = await db.user.findUnique({
            where: { email: existingToken.email }
        });

        if (!existingUser) return { success: false, message: "User does not exist." };

        // Mark as verified
        await db.user.update({
            where: { id: existingUser.id },
            data: { 
                emailVerified: true
            }
        });

        // Delete token
        await db.verificationToken.deleteMany({
            where: { id: existingToken.id }
        });

        return { success: true, message: "Email verified successfully! You can now log in." };
    } catch (error) {
        console.error("Verification error:", error);
        return { success: false, message: "Verification failed." };
    }
}

/**
 * Resets password using token
 */
export async function resetPasswordAction(token: string, password: string) {
    try {
        const validationError = validateStrongPassword(password);
        if (validationError) {
            return { success: false, message: validationError };
        }

        // Additional security: verify JWT signature
        const payload = await verifyJWTToken(token);
        if (!payload || (payload as any).type !== 'password_reset') {
            return { success: false, message: "Invalid or tampered token." };
        }

        const existingToken = await db.passwordResetToken.findUnique({
            where: { token }
        });

        if (!existingToken) return { success: false, message: "Token not found or already used." };

        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) return { success: false, message: "Token has expired." };

        const existingUser = await db.user.findUnique({
            where: { email: existingToken.email }
        });

        if (!existingUser) return { success: false, message: "User does not exist." };

        if (await isPasswordReused(existingUser.id, password)) {
            return { success: false, message: "You cannot reuse one of your last 5 passwords." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword }
        });

        await addPasswordToHistory(existingUser.id, password);

        await db.passwordResetToken.deleteMany({
            where: { id: existingToken.id }
        });

        return { success: true, message: "Password updated successfully!" };
    } catch (error) {
        console.error("Reset error:", error);
        return { success: false, message: "Failed to reset password." };
    }
}
