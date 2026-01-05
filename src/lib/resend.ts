import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

// Create a mock or real Resend instance
// Build will succeed even without the API key
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const isResendConfigured = !!resendApiKey;
