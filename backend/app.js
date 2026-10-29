import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./src/config/config.js";

import authRouter from "./src/routes/user.routes.js";
import mapRouter from "./src/routes/map.routes.js";
import rideRouter from "./src/routes/ride.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configured CORS to allow cookies to pass between frontend and backend
app.use(
  cors({
    origin: ["http://localhost:5173", config.CLIENT_URL], // Your React/Vite frontend origin
    credentials: true, // Allows HTTPOnly cookies and Auth headers
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/maps", mapRouter);
app.use("/api/rides", rideRouter);

export default app;
