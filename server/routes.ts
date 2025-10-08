import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { listMediaFiles, getFileById } from "./googleDrive";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all media from Google Drive
  app.get("/api/media", async (req, res) => {
    try {
      const media = await listMediaFiles();
      res.json(media);
    } catch (error: any) {
      console.error("Error fetching media:", error);
      res.status(500).json({ 
        error: "Failed to fetch media from Google Drive",
        message: error.message 
      });
    }
  });

  // Get specific media item by ID
  app.get("/api/media/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const media = await getFileById(id);
      res.json(media);
    } catch (error: any) {
      console.error(`Error fetching media ${req.params.id}:`, error);
      res.status(500).json({ 
        error: "Failed to fetch media item",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
