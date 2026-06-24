import nodemailer from 'nodemailer';

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required to send transactional email.`);
  }

  return value;
}

export async function sendTransactionalEmail(input: SendMailInput) {
  const transporter = nodemailer.createTransport({
    host: getRequiredEnv('SMTP_HOST'),
    port: Number(getRequiredEnv('SMTP_PORT')),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: getRequiredEnv('SMTP_USER'),
      pass: getRequiredEnv('SMTP_PASSWORD'),
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'OP Supermarket <no-reply@opsupermarket.com>',
    ...input,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${getAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;

  await sendTransactionalEmail({
    to: email,
    subject: 'Verify your OP Supermarket email',
    text: `Verify your OP Supermarket account by opening this link: ${url}`,
    html: `<p>Verify your OP Supermarket account by opening this secure link:</p><p><a href="${url}">${url}</a></p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  await sendTransactionalEmail({
    to: email,
    subject: 'Reset your OP Supermarket password',
    text: `Reset your OP Supermarket password by opening this link: ${url}`,
    html: `<p>Reset your OP Supermarket password by opening this secure link:</p><p><a href="${url}">${url}</a></p>`,
  });
}
