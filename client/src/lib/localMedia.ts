import type { MediaItem } from "@shared/schema";

interface LocalMediaItem {
  id: string;
  name: string;
  filename: string;
  type: "image" | "video";
  mimeType: string;
}

export async function fetchLocalMedia(): Promise<MediaItem[]> {
  try {
    const response = await fetch('/content/media-list.json');
    if (!response.ok) {
      console.error('Failed to load media list');
      return [];
    }
    
    const mediaList: LocalMediaItem[] = await response.json();
    
    return mediaList.map((item) => ({
      id: item.id,
      name: item.name,
      mimeType: item.mimeType,
      thumbnailLink: `/content/${item.filename}`,
      webContentLink: `/content/${item.filename}`,
      webViewLink: `/content/${item.filename}`,
      modifiedTime: new Date().toISOString(),
      size: "0",
      isVideo: item.type === "video",
      isImage: item.type === "image",
    }));
  } catch (error) {
    console.error('Error loading local media:', error);
    return [];
  }
}

export function getMediaUrl(filename: string): string {
  return `/content/${filename}`;
}
