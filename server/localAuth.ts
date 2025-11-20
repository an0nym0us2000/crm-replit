import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
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
          // For local development, we'll use a simple check
          // In production, you'd verify against hashed passwords
          const users = await storage.getAllUsers();
          const user = users.find((u) => u.email === email);

          if (!user) {
            return done(null, false, { message: "Incorrect email." });
          }

          // For development, accept any password
          // In production, you'd verify the password hash
          if (process.env.NODE_ENV === "development") {
            return done(null, {
              id: user.id,
              email: user.email,
              claims: {
                sub: user.id,
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
                profile_image_url: user.profileImageUrl
              }
            });
          }

          return done(null, false, { message: "Authentication not configured for production." });
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

  // Get current user
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub || req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Development-only endpoint to list available users
  if (process.env.NODE_ENV === "development") {
    app.get("/api/dev/users", async (req, res) => {
      try {
        const users = await storage.getAllUsers();
        res.json(users.map(u => ({ id: u.id, email: u.email, role: u.role, firstName: u.firstName, lastName: u.lastName })));
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
