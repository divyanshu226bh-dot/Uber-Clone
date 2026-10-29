import { Resend } from "resend";
import dotenv from "dotenv"
dotenv.config();

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, text, html) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Uber Clone <onboarding@resend.dev>",
    to: [to],
    subject,
    text,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Unable to send verification email");
  }

  console.log("Verification email accepted by Resend:", data?.id);

  return data;
};

