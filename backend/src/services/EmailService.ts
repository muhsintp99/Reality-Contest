import nodemailer from 'nodemailer';
import { logger } from '../core/logger';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
      logger.info('Nodemailer SMTP Transporter initialized successfully.');
    } else {
      logger.warn('Nodemailer SMTP details missing in .env. Running email in log-simulation mode.');
    }
  }

  async sendMail(to: string, subject: string, body: string): Promise<boolean> {
    if (this.transporter) {
      try {
        const from = process.env.SMTP_FROM || 'Reality Contest Platform <noreply@realitycontest.com>';
        await this.transporter.sendMail({
          from,
          to,
          subject,
          text: body,
          html: `
            <div style="font-family: sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 500px; margin: 0 auto; background-color: #0b1120; color: #ffffff;">
              <h2 style="color: #6366f1; margin-top: 0;">Reality Contest Platform</h2>
              <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">${body}</p>
              <br/>
              <hr style="border: 0; border-top: 1px solid #334155; margin-bottom: 16px;"/>
              <p style="font-size: 10px; color: #64748b; text-align: center;">This is an automated verification code. Please do not reply directly.</p>
            </div>
          `
        });
        logger.info(`Email successfully sent to ${to} via SMTP.`);
        return true;
      } catch (err: any) {
        logger.error(`Failed to send SMTP email: ${err.message}`);
        return false;
      }
    } else {
      logger.info(`[SIMULATED EMAIL] To: ${to}. Subject: ${subject}. Body: ${body}`);
      return true;
    }
  }
}

export const emailService = new EmailService();
export default emailService;
