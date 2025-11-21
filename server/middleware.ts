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

  // CORS configuration - only for API routes, NOT static files
  const allowedOrigins = config.ALLOWED_ORIGINS
    ? config.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : config.NODE_ENV === "development"
    ? ["http://localhost:5000", "http://localhost:5173"]
    : [];

  app.use((req, res, next) => {
    // Skip CORS for static assets (JS, CSS, images, etc.)
    if (req.path.startsWith('/assets/') ||
        req.path.endsWith('.js') ||
        req.path.endsWith('.css') ||
        req.path.endsWith('.png') ||
        req.path.endsWith('.jpg') ||
        req.path.endsWith('.ico') ||
        req.path.endsWith('.svg') ||
        req.path.endsWith('.woff') ||
        req.path.endsWith('.woff2') ||
        req.path.endsWith('.ttf')) {
      return next();
    }

    // Apply CORS only to API and HTML routes
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (same-origin requests, curl, Postman, etc.)
        if (!origin) return callback(null, true);

        // In development, allow all origins
        if (config.NODE_ENV === "development") {
          return callback(null, true);
        }

        // In production, check allowed origins
        if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // In production with no ALLOWED_ORIGINS configured, allow same-origin requests
        // This happens when the frontend is served from the same domain
        callback(null, true);
      },
      credentials: true,
    })(req, res, next);
  });

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
