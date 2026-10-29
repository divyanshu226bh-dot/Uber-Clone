import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_USER",
];

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
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  GOOGLE_USER: process.env.GOOGLE_USER,
};
