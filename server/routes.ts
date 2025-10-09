import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data for demo/fallback
const mockMedia = [
  {
    id: "1",
    name: "Nature Video",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    webViewLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    modifiedTime: new Date().toISOString(),
    size: "2048000",
    isVideo: true,
    isImage: false,
  },
  {
    id: "2",
    name: "Mountain View",
    mimeType: "image/jpeg",
    thumbnailLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    webContentLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080",
    webViewLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080",
    modifiedTime: new Date().toISOString(),
    size: "2048000",
    isVideo: false,
    isImage: true,
  },
  {
    id: "3",
    name: "City Timelapse",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    webViewLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    modifiedTime: new Date().toISOString(),
    size: "3072000",
    isVideo: true,
    isImage: false,
  },
  {
    id: "4",
    name: "Forest Path",
    mimeType: "image/jpeg",
    thumbnailLink: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
    webContentLink: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080",
    webViewLink: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080",
    modifiedTime: new Date().toISOString(),
    size: "1792000",
    isVideo: false,
    isImage: true,
  },
  {
    id: "5",
    name: "Ocean Waves Video",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    webViewLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    modifiedTime: new Date().toISOString(),
    size: "2560000",
    isVideo: true,
    isImage: false,
  },
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoints for deployment (fast response, no expensive operations)
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
  });
  
  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
  });

  // Get all media from Google Drive (with fallback to mock data)
  app.get("/api/media", async (req, res) => {
    try {
      const media = await listMediaFiles();
      if (media && media.length > 0) {
        res.json(media);
      } else {
        console.log("No media found in Google Drive, using mock data");
        res.json(mockMedia);
      }
    } catch (error: any) {
      console.error("Error fetching media from Google Drive, using mock data:", error.message);
      res.json(mockMedia);
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
      const mockItem = mockMedia.find(m => m.id === req.params.id);
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

  // Proxy endpoint to serve media files with authentication
  app.get("/api/media/:id/content", async (req, res) => {
    try {
      const { id } = req.params;
      const { default: fetch } = await import('node-fetch');
      const { getGoogleDriveClient } = await import('./googleDrive.js');
      
      const drive = await getGoogleDriveClient();
      
      // Get file metadata to check mime type
      const fileResponse = await drive.files.get({
        fileId: id,
        fields: 'mimeType, name',
      });
      
      const mimeType = fileResponse.data.mimeType || 'application/octet-stream';
      
      // Get the file content with alt=media
      const response = await drive.files.get(
        {
          fileId: id,
          alt: 'media',
        },
        {
          responseType: 'stream',
        }
      );
      
      // Set appropriate headers
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      
      // Pipe the stream to response
      (response.data as any).pipe(res);
    } catch (error: any) {
      console.error(`Error serving media content ${req.params.id}:`, error);
      res.status(500).json({ 
        error: "Failed to load media",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
