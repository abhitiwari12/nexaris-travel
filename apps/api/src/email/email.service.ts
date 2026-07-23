import { Injectable } from '@nestjs/common';

type EmailPayload = { to: string; subject: string; html: string };

@Injectable()
export class EmailService {
  async send(payload: EmailPayload): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
      console.info(JSON.stringify({ channel: 'email', to: payload.to, subject: payload.subject }));
      return;
    }
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM ?? 'Nexaris Travel AI <no-reply@nexaris.ai>', ...payload }) });
    if (!response.ok) throw new Error(`Resend email failed with ${response.status}`);
  }
  sendVerificationEmail(to: string, token: string): Promise<void> { return this.send({ to, subject: 'Verify your Nexaris Travel AI account', html: `<p>Use this secure verification token: <strong>${token}</strong></p>` }); }
  sendPasswordResetEmail(to: string, token: string): Promise<void> { return this.send({ to, subject: 'Reset your Nexaris Travel AI password', html: `<p>Use this password reset token: <strong>${token}</strong></p>` }); }
  sendWelcomeEmail(to: string): Promise<void> { return this.send({ to, subject: 'Welcome to Nexaris Travel AI', html: '<p>Your AI-powered travel command center is ready.</p>' }); }
}
