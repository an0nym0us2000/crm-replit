import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);

  // Use PostgreSQL session store in production, memory store in development
  const sessionStore = process.env.NODE_ENV === "production"
    ? new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl,
        tableName: "sessions",
      })
    : undefined;

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const users = await storage.getAllUsers();
          const user = users.find((u) => u.email === email);

          if (!user) {
            return done(null, false, { message: "Invalid email or password." });
          }

          if (user.status !== "active") {
            return done(null, false, { message: "Account is inactive." });
          }

          // Check if password exists (for migration from dev to prod)
          if (!user.password) {
            // In development, allow login without password for backward compatibility
            if (process.env.NODE_ENV === "development") {
              return done(null, {
                id: user.id,
                email: user.email,
                claims: {
                  sub: user.id,
                  email: user.email,
                  first_name: user.firstName,
                  last_name: user.lastName,
                  profile_image_url: user.profileImageUrl,
                },
              });
            }
            return done(null, false, { message: "Password not set. Please contact administrator." });
          }

          // Verify password
          const isValid = await verifyPassword(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password." });
          }

          return done(null, {
            id: user.id,
            email: user.email,
            claims: {
              sub: user.id,
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
              profile_image_url: user.profileImageUrl,
            },
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        return res.json({ message: "Login successful", user });
      });
    })(req, res, next);
  });

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Check if user already exists
      const existingUsers = await storage.getAllUsers();
      if (existingUsers.some((u) => u.email === email)) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      await storage.upsertUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "employee", // Default role
        status: "active",
      });

      res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Get current user
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub || req.user.id;
      const user = await storage.getUser(userId);

      // Don't send password hash to client
      const { password, ...userWithoutPassword } = user as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Change password endpoint
  app.post("/api/change-password", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub || req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      const user = await storage.getUser(userId);

      // Verify current password
      if (user.password) {
        const isValid = await verifyPassword(currentPassword, user.password);
        if (!isValid) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { password: hashedPassword });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Development-only endpoint to list available users
  if (process.env.NODE_ENV === "development") {
    app.get("/api/dev/users", async (req, res) => {
      try {
        const users = await storage.getAllUsers();
        res.json(
          users.map((u) => ({
            id: u.id,
            email: u.email,
            role: u.role,
            firstName: u.firstName,
            lastName: u.lastName,
          }))
        );
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
      }
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Middleware to check if user has required role
export function requireRole(...allowedRoles: string[]): RequestHandler {
  return async (req, res, next) => {
    const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
