import type { MediaItem } from "@shared/schema";

interface LocalMediaItem {
  id: string;
  name: string;
  file: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
}

interface MediaListResponse {
  version?: string;
  lastModified?: string;
  items: LocalMediaItem[];
}

const CACHE_VERSION_KEY = 'media-cache-version';
const CACHE_DATA_KEY = 'media-cache-data';
const CACHE_TIMESTAMP_KEY = 'media-cache-timestamp';
const CACHE_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchLocalMedia(): Promise<MediaItem[]> {
  try {
    // Add cache-busting timestamp to prevent browser caching
    const cacheBuster = Date.now();
    const response = await fetch(`/content/media-list.json?t=${cacheBuster}`, {
      cache: 'no-store', // Prevent browser caching
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to load media list');
      // Try to return cached data if available
      return getCachedMedia();
    }
    
    const data = await response.json();
    
    // Support both array format (legacy) and object format with version
    let mediaList: LocalMediaItem[];
    let version: string | undefined;
    let lastModified: string | undefined;
    
    if (Array.isArray(data)) {
      mediaList = data;
    } else {
      const typedData = data as MediaListResponse;
      mediaList = typedData.items || [];
      version = typedData.version;
      lastModified = typedData.lastModified;
    }
    
    // Check if version has changed and clear cache if needed
    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    const currentVersion = version || lastModified || String(cacheBuster);
    
    if (cachedVersion && cachedVersion !== currentVersion) {
      console.log('Content version changed, clearing cache');
      clearMediaCache();
    }
    
    // Transform to MediaItem format
    const mediaItems = mediaList.map((item) => ({
      id: item.id,
      name: item.name,
      mimeType: item.mimeType,
      thumbnailLink: `/content/${item.file}`,
      webContentLink: `/content/${item.file}`,
      webViewLink: `/content/${item.file}`,
      modifiedTime: item.modifiedTime || new Date().toISOString(),
      size: "0",
      isVideo: item.mimeType.startsWith('video/'),
      isImage: item.mimeType.startsWith('image/'),
    }));
    
    // Cache the data with version and timestamp
    try {
      localStorage.setItem(CACHE_VERSION_KEY, currentVersion);
      localStorage.setItem(CACHE_DATA_KEY, JSON.stringify(mediaItems));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
    } catch (e) {
      // If localStorage is full, clear old cache and try again
      clearMediaCache();
      try {
        localStorage.setItem(CACHE_VERSION_KEY, currentVersion);
        localStorage.setItem(CACHE_DATA_KEY, JSON.stringify(mediaItems));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
      } catch (e2) {
        console.warn('Unable to cache media data:', e2);
      }
    }
    
    return mediaItems;
  } catch (error) {
    console.error('Error loading local media:', error);
    // Return cached data if available
    return getCachedMedia();
  }
}

function getCachedMedia(): MediaItem[] {
  try {
    const cachedData = localStorage.getItem(CACHE_DATA_KEY);
    const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !cacheTimestamp) {
      return [];
    }
    
    // Check if cache is still valid (within 24 hours)
    const age = Date.now() - parseInt(cacheTimestamp, 10);
    if (age > CACHE_VALIDITY_MS) {
      console.log('Cache expired, clearing');
      clearMediaCache();
      return [];
    }
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Error reading cached media:', error);
    return [];
  }
}

function clearMediaCache(): void {
  localStorage.removeItem(CACHE_VERSION_KEY);
  localStorage.removeItem(CACHE_DATA_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}

export function getMediaUrl(filename: string): string {
  return `/content/${filename}`;
}
