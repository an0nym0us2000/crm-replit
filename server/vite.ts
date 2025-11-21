import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, the built files are in dist/public
  // When server runs from dist/index.js, we need to look for public in the same dist folder
  const distPath = path.resolve(import.meta.dirname, "public");

  // Fallback: if we're running from project root somehow, look for dist/public
  const fallbackPath = path.resolve(process.cwd(), "dist", "public");

  let actualDistPath = distPath;

  // Check which path exists
  if (!fs.existsSync(distPath) && fs.existsSync(fallbackPath)) {
    actualDistPath = fallbackPath;
  }

  if (!fs.existsSync(actualDistPath)) {
    log(`Looking for build directory at: ${distPath}`, "express");
    log(`Also checked: ${fallbackPath}`, "express");
    log(`Current working directory: ${process.cwd()}`, "express");
    log(`import.meta.dirname: ${import.meta.dirname}`, "express");
    throw new Error(
      `Could not find the build directory: ${actualDistPath}, make sure to build the client first`,
    );
  }

  log(`Serving static files from: ${actualDistPath}`, "express");

  app.use(express.static(actualDistPath, {
    maxAge: "1d",
    etag: true,
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(actualDistPath, "index.html"));
  });
}
