// backend/controllers/email.controller.js
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config(); // carrega variáveis do .env

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html
    });

    res.status(200).json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
