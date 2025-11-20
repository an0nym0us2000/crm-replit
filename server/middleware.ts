import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import type { Express } from "express";
import { getConfig } from "./config";

export function setupSecurityMiddleware(app: Express) {
  const config = getConfig();

  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: config.NODE_ENV === "production",
      crossOriginEmbedderPolicy: config.NODE_ENV === "production",
    })
  );

  // CORS configuration
  const allowedOrigins = config.ALLOWED_ORIGINS
    ? config.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : config.NODE_ENV === "development"
    ? ["http://localhost:5000", "http://localhost:5173"]
    : [];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (config.NODE_ENV === "development" || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  // Compression
  app.use(compression());

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.NODE_ENV === "development" ? 100 : 5, // More lenient in development
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    // Skip auth rate limiting in development for easier testing
    skip: () => config.NODE_ENV === "development",
  });

  app.use("/api/login", authLimiter);
  app.use("/api/register", authLimiter);

  // General API rate limiting
  const apiLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development
    skip: () => config.NODE_ENV === "development",
  });

  app.use("/api", apiLimiter);
}
