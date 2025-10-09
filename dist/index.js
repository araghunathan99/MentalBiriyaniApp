var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/googleDrive.ts
var googleDrive_exports = {};
__export(googleDrive_exports, {
  getFileById: () => getFileById,
  getGoogleDriveClient: () => getGoogleDriveClient,
  listMediaFiles: () => listMediaFiles
});
import { google } from "googleapis";
async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=google-drive",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  ).then((res) => res.json()).then((data) => data.items?.[0]);
  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) {
    throw new Error("Google Drive not connected");
  }
  return accessToken;
}
async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  return google.drive({ version: "v3", auth: oauth2Client });
}
async function listMediaFiles() {
  try {
    const drive = await getGoogleDriveClient();
    console.log('Searching for "MentalBiriyani" folder in Google Drive...');
    const folderResponse = await drive.files.list({
      q: "name='MentalBiriyani' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id, name)",
      pageSize: 1
    });
    const folders = folderResponse.data.files || [];
    if (folders.length === 0) {
      throw new Error('Folder "MentalBiriyani" not found in Google Drive. Please create this folder and add photos/videos to it.');
    }
    const folderId = folders[0].id;
    console.log(`\u2713 Found folder "MentalBiriyani" (ID: ${folderId})`);
    const allFiles = [];
    let nextPageToken = void 0;
    let pageCount = 0;
    do {
      pageCount++;
      const response = await drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`,
        fields: "nextPageToken, files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size)",
        pageSize: 100,
        orderBy: "modifiedTime desc",
        pageToken: nextPageToken || void 0
      });
      const files = response.data.files || [];
      allFiles.push(...files);
      nextPageToken = response.data.nextPageToken;
      console.log(`  Page ${pageCount}: Found ${files.length} files (total so far: ${allFiles.length})`);
    } while (nextPageToken);
    if (allFiles.length === 0) {
      throw new Error('No photos or videos found in "MentalBiriyani" folder. Please add some media files to this folder.');
    }
    console.log(`\u2713 Found ${allFiles.length} total photos and videos in "MentalBiriyani" folder`);
    return allFiles.map((file) => ({
      id: file.id || "",
      name: file.name || "",
      mimeType: file.mimeType || "",
      thumbnailLink: file.thumbnailLink,
      webContentLink: file.webContentLink,
      webViewLink: file.webViewLink,
      modifiedTime: file.modifiedTime,
      size: file.size,
      isVideo: file.mimeType?.startsWith("video/") || false,
      isImage: file.mimeType?.startsWith("image/") || false
    }));
  } catch (error) {
    console.error("Failed to fetch media from Google Drive:", error);
    throw error;
  }
}
async function getFileById(fileId) {
  try {
    const drive = await getGoogleDriveClient();
    const response = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size"
    });
    const file = response.data;
    return {
      id: file.id || "",
      name: file.name || "",
      mimeType: file.mimeType || "",
      thumbnailLink: file.thumbnailLink,
      webContentLink: file.webContentLink,
      webViewLink: file.webViewLink,
      modifiedTime: file.modifiedTime,
      size: file.size,
      isVideo: file.mimeType?.startsWith("video/") || false,
      isImage: file.mimeType?.startsWith("image/") || false
    };
  } catch (error) {
    console.error(`Error fetching media item ${fileId}:`, error);
    throw error;
  }
}
var connectionSettings;
var init_googleDrive = __esm({
  "server/googleDrive.ts"() {
    "use strict";
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_googleDrive();
import { createServer } from "http";
var mockMedia = [
  {
    id: "1",
    name: "Nature Video",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    webViewLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    modifiedTime: (/* @__PURE__ */ new Date()).toISOString(),
    size: "2048000",
    isVideo: true,
    isImage: false
  },
  {
    id: "2",
    name: "Mountain View",
    mimeType: "image/jpeg",
    thumbnailLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    webContentLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080",
    webViewLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080",
    modifiedTime: (/* @__PURE__ */ new Date()).toISOString(),
    size: "2048000",
    isVideo: false,
    isImage: true
  },
  {
    id: "3",
    name: "City Timelapse",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    webViewLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    modifiedTime: (/* @__PURE__ */ new Date()).toISOString(),
    size: "3072000",
    isVideo: true,
    isImage: false
  },
  {
    id: "4",
    name: "Forest Path",
    mimeType: "image/jpeg",
    thumbnailLink: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    webContentLink: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080",
    webViewLink: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080",
    modifiedTime: (/* @__PURE__ */ new Date()).toISOString(),
    size: "1792000",
    isVideo: false,
    isImage: true
  },
  {
    id: "5",
    name: "Ocean Waves Video",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    webViewLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    modifiedTime: (/* @__PURE__ */ new Date()).toISOString(),
    size: "2560000",
    isVideo: true,
    isImage: false
  }
];
async function registerRoutes(app2) {
  app2.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
  });
  app2.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
  });
  app2.get("/api/media", async (req, res) => {
    try {
      const media = await listMediaFiles();
      if (media && media.length > 0) {
        res.json(media);
      } else {
        console.log("No media found in Google Drive, using mock data");
        res.json(mockMedia);
      }
    } catch (error) {
      console.error("Error fetching media from Google Drive, using mock data:", error.message);
      res.json(mockMedia);
    }
  });
  app2.get("/api/media/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const media = await getFileById(id);
      res.json(media);
    } catch (error) {
      console.error(`Error fetching media ${req.params.id}:`, error);
      const mockItem = mockMedia.find((m) => m.id === req.params.id);
      if (mockItem) {
        res.json(mockItem);
      } else {
        res.status(404).json({
          error: "Media not found",
          message: error.message
        });
      }
    }
  });
  app2.get("/api/media/:id/content", async (req, res) => {
    try {
      const { id } = req.params;
      const { default: fetch2 } = await import("node-fetch");
      const { getGoogleDriveClient: getGoogleDriveClient2 } = await Promise.resolve().then(() => (init_googleDrive(), googleDrive_exports));
      const drive = await getGoogleDriveClient2();
      const fileResponse = await drive.files.get({
        fileId: id,
        fields: "mimeType, name"
      });
      const mimeType = fileResponse.data.mimeType || "application/octet-stream";
      const response = await drive.files.get(
        {
          fileId: id,
          alt: "media"
        },
        {
          responseType: "stream"
        }
      );
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      response.data.pipe(res);
    } catch (error) {
      console.error(`Error serving media content ${req.params.id}:`, error);
      res.status(500).json({
        error: "Failed to load media",
        message: error.message
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
