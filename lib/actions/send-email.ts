'use server'

import { Resend } from 'resend';
import nodemailer from 'nodemailer';
// Initialize Resend with your API key if it exists
const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

// SMTP Configuration for Nodemailer
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
};

const transporter = smtpConfig.host ? nodemailer.createTransport(smtpConfig) : null;

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  // 1. Try Nodemailer/SMTP if configured (User Preference for personal Gmail/Custom SMTP)
  if (transporter) {
    try {
      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });
      return { success: true };
    } catch (error) {
      console.error('Nodemailer/SMTP error:', error);
    }
  }

  // 2. Try Resend if configured
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
      });

      if (!error) {
        return { success: true, data };
      }
      
      console.error('Resend API error:', error);
    } catch (error) {
      console.error('Resend execution error:', error);
    }
  }


  // 3. Final Fallback
  return {
    success: false,
    message: "Failed to send email. No email providers succeeded.",
    fallbackLogged: true
  };
}


