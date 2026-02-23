import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('SMTP not configured. Magic links will be logged to console.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(port) || 587,
    secure: parseInt(port) === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendMagicLink(email, token, dealName) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const magicLink = `${frontendUrl}/auth/verify?token=${token}`;
  const from = process.env.SMTP_FROM || `${dealName} Portal <noreply@example.com>`;

  const transport = getTransporter();

  if (!transport) {
    console.log('');
    console.log('========================================');
    console.log('  MAGIC LINK (dev mode - no SMTP)');
    console.log('========================================');
    console.log(`  Email: ${email}`);
    console.log(`  Link:  ${magicLink}`);
    console.log('========================================');
    console.log('');
    return;
  }

  await transport.sendMail({
    from,
    to: email,
    subject: `Sign in to ${dealName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1B4332; margin-bottom: 8px;">${dealName}</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">
          Click the button below to sign in to your investor portal. This link expires in 15 minutes.
        </p>
        <a href="${magicLink}" style="display: inline-block; background-color: #1B4332; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 500; margin: 24px 0;">
          Sign In
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 32px;">
          If you didn't request this link, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Sign in to ${dealName}\n\nClick this link to sign in: ${magicLink}\n\nThis link expires in 15 minutes.`,
  });
}
