import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import campaignRoutes from "./routes/campaignRoutes";
import authRoutes from "./routes/authRoutes";
import passport from "./config/passport";

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use(passport.initialize());

// Authentication routes
app.use("/auth", authRoutes);

// Campaign routes
app.use("/api", campaignRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "ReachInbox backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
