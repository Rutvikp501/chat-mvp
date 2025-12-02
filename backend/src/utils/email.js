import { createWelcomeEmailTemplate } from "../assets/email_templets/welcome-email.js";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

   const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Welcome to Chatify!`,
      html: createWelcomeEmailTemplate(name, clientURL),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Welcome Email sent successfully", info);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

