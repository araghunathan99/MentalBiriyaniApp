// IndexedDB-based cache for media blobs (images and videos)
const DB_NAME = 'mental-biriyani-media';
const DB_VERSION = 1;
const STORE_NAME = 'media-blobs';

interface CachedBlob {
  url: string;
  blob: Blob;
  timestamp: number;
  mimeType: string;
}

// Request persistent storage (prevents browser from deleting data)
async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(`📦 Persistent storage ${isPersisted ? 'granted' : 'denied'}`);
      return isPersisted;
    } catch (error) {
      console.error('Error requesting persistent storage:', error);
    }
  }
  return false;
}

// Check storage quota
export async function getStorageQuota(): Promise<{ used: number; available: number; percentUsed: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const available = estimate.quota || 0;
      const percentUsed = available > 0 ? (used / available) * 100 : 0;
      
      console.log(`💾 Storage: ${(used / 1024 / 1024).toFixed(2)} MB / ${(available / 1024 / 1024).toFixed(2)} MB (${percentUsed.toFixed(1)}% used)`);
      
      return { used, available, percentUsed };
    } catch (error) {
      console.error('Error checking storage quota:', error);
    }
  }
  return null;
}

// Initialize IndexedDB
async function openDB(): Promise<IDBDatabase> {
  // Request persistent storage on first open
  await requestPersistentStorage();
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Get cached blob from IndexedDB
export async function getCachedBlob(url: string): Promise<string | null> {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);
      
      request.onsuccess = () => {
        const cached = request.result as CachedBlob | undefined;
        if (cached) {
          // Create object URL from blob
          const objectUrl = URL.createObjectURL(cached.blob);
          resolve(objectUrl);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting cached blob:', error);
    return null;
  }
}

// Cache blob to IndexedDB with quota error handling
export async function setCachedBlob(url: string, blob: Blob, mimeType: string): Promise<void> {
  try {
    const db = await openDB();
    
    return new Promise(async (resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const cachedBlob: CachedBlob = {
        url,
        blob,
        timestamp: Date.now(),
        mimeType,
      };
      
      const request = store.put(cachedBlob);
      
      request.onsuccess = () => resolve();
      request.onerror = async () => {
        const error = request.error;
        
        // Handle quota exceeded error
        if (error && error.name === 'QuotaExceededError') {
          console.warn('⚠️ Storage quota exceeded! Cleaning up old data...');
          
          // Show current quota
          await getStorageQuota();
          
          // Clear old cache entries (older than 7 days)
          await clearOldCache();
          
          // Try again
          try {
            const retryTx = db.transaction(STORE_NAME, 'readwrite');
            const retryStore = retryTx.objectStore(STORE_NAME);
            const retryRequest = retryStore.put(cachedBlob);
            
            retryRequest.onsuccess = () => {
              console.log('✓ Cached blob after cleanup');
              resolve();
            };
            retryRequest.onerror = () => reject(retryRequest.error);
          } catch (retryError) {
            console.error('Failed to cache after cleanup:', retryError);
            reject(retryError);
          }
        } else {
          reject(error);
        }
      };
    });
  } catch (error) {
    console.error('Error caching blob:', error);
  }
}

// Prefetch media (cache without creating blob URL - for background prefetching)
export async function prefetchMedia(url: string): Promise<void> {
  try {
    const db = await openDB();
    
    // Check if already cached
    const exists = await new Promise<boolean>((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);
      
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => resolve(false);
    });
    
    if (exists) {
      return; // Already cached
    }
    
    // Fetch and cache
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    
    const blob = await response.blob();
    const mimeType = response.headers.get('content-type') || blob.type;
    
    await setCachedBlob(url, blob, mimeType);
  } catch (error) {
    console.error('Error prefetching media:', error);
  }
}

// Fetch and cache media (creates blob URL for immediate use)
export async function fetchAndCacheMedia(url: string): Promise<string> {
  // Check cache first
  const cached = await getCachedBlob(url);
  if (cached) {
    return cached;
  }
  
  // Fetch from network
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    
    const blob = await response.blob();
    const mimeType = response.headers.get('content-type') || blob.type;
    
    // Cache the blob
    await setCachedBlob(url, blob, mimeType);
    
    // Return object URL
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching media:', error);
    // Return original URL as fallback
    return url;
  }
}

// Clear old cache entries (keep last 7 days)
export async function clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const db = await openDB();
    const cutoffTime = Date.now() - maxAge;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}

// Clear all cache
export async function clearAllMediaCache(): Promise<void> {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
