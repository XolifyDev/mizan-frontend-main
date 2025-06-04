"use server"

import { Resend } from 'resend';
import InvitingUser from '@/components/emails/InvitingUser';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMasjidInvite({
  to,
  userName,
  masjidName,
  inviteLink,
  inviterName,
  supportEmail,
  token,
}: {
  to: string;
  userName: string;
  masjidName: string;
  inviteLink: string;
  inviterName?: string;
  supportEmail?: string;
  token?: string;
}) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject: `You're invited to ${masjidName} on Mizan!`,
    react: InvitingUser({
      userName,
      masjidName,
      inviteLink,
      inviterName,
      supportEmail,
      token,
    }),
  });
}