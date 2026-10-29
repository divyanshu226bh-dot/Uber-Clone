import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "RESEND_API_KEY"];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined in the environment variables.`);
  }
}

export default {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || "Uber Clone <onboarding@resend.dev>",
};
