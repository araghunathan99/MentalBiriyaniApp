import type { MediaItem } from "./types";

const CACHE_KEY = "drive-reels-media-cache";
const CACHE_METADATA_KEY = "drive-reels-cache-metadata";
const MAX_CACHE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB limit for localStorage

interface CachedMedia {
  data: MediaItem[];
  timestamp: number;
  size: number;
}

interface CacheMetadata {
  totalSize: number;
  lastAccessed: Record<string, number>;
}

function getCacheMetadata(): CacheMetadata {
  try {
    const metadata = localStorage.getItem(CACHE_METADATA_KEY);
    return metadata ? JSON.parse(metadata) : { totalSize: 0, lastAccessed: {} };
  } catch {
    return { totalSize: 0, lastAccessed: {} };
  }
}

function setCacheMetadata(metadata: CacheMetadata): void {
  try {
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
  } catch (e) {
    console.warn("Failed to save cache metadata:", e);
  }
}

function estimateSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size;
}

export function getCachedMedia(): MediaItem[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsedCache: CachedMedia = JSON.parse(cached);
    
    // Update last accessed time
    const metadata = getCacheMetadata();
    metadata.lastAccessed[CACHE_KEY] = Date.now();
    setCacheMetadata(metadata);

    return parsedCache.data;
  } catch (e) {
    console.warn("Failed to retrieve cached media:", e);
    return null;
  }
}

export function setCachedMedia(media: MediaItem[]): boolean {
  try {
    const cacheData: CachedMedia = {
      data: media,
      timestamp: Date.now(),
      size: estimateSize(media),
    };

    const metadata = getCacheMetadata();
    
    // Check if new data exceeds max size
    if (cacheData.size > MAX_CACHE_SIZE_BYTES) {
      console.warn("Media data too large to cache:", cacheData.size);
      return false;
    }

    // Calculate new total size
    const currentCacheSize = estimateSize(localStorage.getItem(CACHE_KEY) || "");
    const newTotalSize = metadata.totalSize - currentCacheSize + cacheData.size;

    // If new total exceeds limit, clear old cache
    if (newTotalSize > MAX_CACHE_SIZE_BYTES) {
      clearCache();
      metadata.totalSize = cacheData.size;
    } else {
      metadata.totalSize = newTotalSize;
    }

    // Save the cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    
    // Update metadata
    metadata.lastAccessed[CACHE_KEY] = Date.now();
    setCacheMetadata(metadata);

    return true;
  } catch (e) {
    // QuotaExceededError or other storage issues
    console.warn("Failed to cache media, clearing old cache:", e);
    clearCache();
    
    // Try once more after clearing
    try {
      const cacheData: CachedMedia = {
        data: media,
        timestamp: Date.now(),
        size: estimateSize(media),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      const metadata: CacheMetadata = {
        totalSize: cacheData.size,
        lastAccessed: { [CACHE_KEY]: Date.now() },
      };
      setCacheMetadata(metadata);
      
      return true;
    } catch (retryError) {
      console.error("Failed to cache media after retry:", retryError);
      return false;
    }
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    const metadata = getCacheMetadata();
    metadata.totalSize = 0;
    delete metadata.lastAccessed[CACHE_KEY];
    setCacheMetadata(metadata);
  } catch (e) {
    console.warn("Failed to clear cache:", e);
  }
}

export function getCacheInfo(): { size: number; itemCount: number; timestamp: number | null } {
  const cached = getCachedMedia();
  const metadata = getCacheMetadata();
  
  if (!cached) {
    return { size: 0, itemCount: 0, timestamp: null };
  }

  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    const parsedCache: CachedMedia = cacheStr ? JSON.parse(cacheStr) : null;
    
    return {
      size: metadata.totalSize,
      itemCount: cached.length,
      timestamp: parsedCache?.timestamp || null,
    };
  } catch {
    return { size: 0, itemCount: 0, timestamp: null };
  }
}

export function isCacheValid(maxAgeMs: number = 24 * 60 * 60 * 1000): boolean {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return false;

    const parsedCache: CachedMedia = JSON.parse(cacheStr);
    const age = Date.now() - parsedCache.timestamp;
    
    return age < maxAgeMs;
  } catch {
    return false;
  }
}
