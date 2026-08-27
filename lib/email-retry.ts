import { sendEmail, EmailPayload } from "@/lib/actions/send-email";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendWithRetry(
  to: string,
  subject: string,
  html: string,
  maxRetries = 3
) {
  const payload: EmailPayload = { to, subject, html };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendEmail(payload);
      if (result.success) {
        return { success: true, attempt };
      }
      console.error(
        `[EmailRetry] Attempt ${attempt}/${maxRetries} failed for ${to}: ${result.message}`
      );
    } catch (error) {
      console.error(
        `[EmailRetry] Attempt ${attempt}/${maxRetries} threw for ${to}:`,
        error
      );
    }

    if (attempt < maxRetries) {
      await delay(1000);
    }
  }

  return { success: false, message: `Failed after ${maxRetries} attempts` };
}

export function scheduleRetry(
  to: string,
  subject: string,
  html: string,
  attemptNumber: number
) {
  const delayMs = Math.min(1000 * Math.pow(2, attemptNumber - 1), 30000);

  return {
    scheduled: true,
    to,
    subject,
    attemptNumber,
    delayMs,
    retryAt: new Date(Date.now() + delayMs).toISOString(),
  };
}
