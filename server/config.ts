import { z } from "zod";

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters for security"),
  PORT: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().positive()).default("5000"),

  // Optional in development, required in production
  ALLOWED_ORIGINS: z.string().optional(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default("900000"), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default("100"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

let config: Env;

export function validateEnv(): Env {
  if (config) return config;

  try {
    config = envSchema.parse(process.env);

    // Additional production checks
    if (config.NODE_ENV === "production") {
      if (!process.env.ALLOWED_ORIGINS) {
        console.warn("⚠️  WARNING: ALLOWED_ORIGINS not set in production. CORS will be restricted.");
      }

      if (config.SESSION_SECRET.length < 64) {
        console.warn("⚠️  WARNING: SESSION_SECRET should be at least 64 characters in production.");
      }
    }

    console.log(`✓ Environment validated for ${config.NODE_ENV} mode`);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export function getConfig(): Env {
  if (!config) {
    throw new Error("Config not initialized. Call validateEnv() first.");
  }
  return config;
}
