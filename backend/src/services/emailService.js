const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      logger.warn('SMTP credentials not configured. Email notifications disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('SMTP connection failed:', error.message);
      } else {
        logger.info('✅ SMTP server ready. Email notifications enabled.');
      }
    });
  }

  /**
   * Send email notification
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter) {
      logger.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Advocate Platform'}" <${process.env.EMAIL_FROM || 'noreply@advocate.com'}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${result.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error.message);
      return false;
    }
  }

  /**
   * Send hearing reminder email
   */
  async sendHearingReminder({ userEmail, caseTitle, hearingDate, hearingTime, courtName }) {
    const subject = `⚖️ Hearing Reminder: ${caseTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c8a84b;">Hearing Reminder</h2>
        <p>You have an upcoming hearing scheduled:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Case:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${caseTitle}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(hearingDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Time:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${hearingTime}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Court:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${courtName || 'TBD'}</td>
          </tr>
        </table>
        <p style="color: #666; font-size: 14px;">Please ensure all documents and preparations are complete before the hearing.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">This is an automated message from Advocate Intelligence Platform.</p>
      </div>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }

  /**
   * Send deadline warning email
   */
  async sendDeadlineWarning({ userEmail, taskTitle, dueDate }) {
    const subject = `⏰ Task Deadline Approaching: ${taskTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Deadline Warning</h2>
        <p>A task deadline is approaching:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Task:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${taskTitle}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Due Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(dueDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
        </table>
        <p style="color: #666; font-size: 14px;">Please complete this task before the deadline.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">This is an automated message from Advocate Intelligence Platform.</p>
      </div>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }

  /**
   * Strip HTML tags for plain text version
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

module.exports = new EmailService();
