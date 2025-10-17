// IndexedDB-based cache for media blobs (images and videos)
const DB_NAME = 'mental-biriyani-media';
const DB_VERSION = 1;
const STORE_NAME = 'media-blobs';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB limit for iOS compatibility

interface CachedBlob {
  url: string;
  blob: Blob;
  timestamp: number;
  mimeType: string;
}

// Detect iOS/iPadOS (ALL browsers including Safari, Chrome, Firefox, Edge, etc.)
// Apple requires all iOS browsers to use WebKit, so they all have the same IndexedDB blob limitations
function isIOS(): boolean {
  const ua = navigator.userAgent;
  
  // Check for traditional iOS devices (iPhone, iPad, iPod)
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  
  // Check for iPadOS (reports as Mac but has touch support)
  const isMac = /Macintosh/.test(ua);
  const hasTouchPoints = navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
  const isIPadOS = isMac && hasTouchPoints;
  
  // This detects ALL browsers on iOS (Safari, Chrome, Firefox, Edge, etc.)
  // since Apple requires all iOS browsers to use WebKit under the hood
  return isIOSDevice || isIPadOS;
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

// Get total cache size
async function getCacheSize(): Promise<number> {
  try {
    const db = await openDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const items = request.result as CachedBlob[];
        const totalSize = items.reduce((sum, item) => sum + item.blob.size, 0);
        resolve(totalSize);
      };
      
      request.onerror = () => resolve(0);
    });
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
}

// Check storage quota
export async function getStorageQuota(): Promise<{ used: number; available: number; percentUsed: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const available = estimate.quota || 0;
      const percentUsed = available > 0 ? (used / available) * 100 : 0;
      
      const cacheSize = await getCacheSize();
      const cacheMB = (cacheSize / 1024 / 1024).toFixed(2);
      const limitMB = (MAX_CACHE_SIZE / 1024 / 1024).toFixed(0);
      
      console.log(`💾 Cache: ${cacheMB} MB / ${limitMB} MB | Storage: ${(used / 1024 / 1024).toFixed(2)} MB / ${(available / 1024 / 1024).toFixed(2)} MB`);
      
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
  // Skip IndexedDB on iOS (all browsers) due to WebKit blob limitations
  if (isIOS()) {
    console.log('🍎 iOS detected (any browser) - skipping IndexedDB cache');
    return null;
  }
  
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(url);
      
      request.onsuccess = () => {
        const cached = request.result as CachedBlob | undefined;
        if (cached) {
          // Verify blob is not corrupted
          if (cached.blob.size === 0) {
            console.warn('⚠️ Corrupted blob detected (0 bytes), skipping cache');
            resolve(null);
            return;
          }
          
          // Create object URL from blob
          const objectUrl = URL.createObjectURL(cached.blob);
          console.log(`✓ Retrieved from cache: ${(cached.blob.size / 1024).toFixed(2)} KB`);
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
  // Skip caching on iOS (all browsers) due to WebKit blob limitations
  if (isIOS()) {
    return;
  }
  
  try {
    const db = await openDB();
    
    // Check cache size before adding
    const currentSize = await getCacheSize();
    
    // If adding this blob would exceed 100MB, clear old entries first
    if (currentSize + blob.size > MAX_CACHE_SIZE) {
      console.log(`📦 Cache limit reached (${(currentSize / 1024 / 1024).toFixed(2)} MB), cleaning up...`);
      await clearOldCache(3 * 24 * 60 * 60 * 1000); // Clear entries older than 3 days
      
      // If still over limit, clear more aggressively
      const newSize = await getCacheSize();
      if (newSize + blob.size > MAX_CACHE_SIZE) {
        await clearOldCache(1 * 24 * 60 * 60 * 1000); // Clear entries older than 1 day
      }
    }
    
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
          
          // Clear old cache entries
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
  // On iOS (all browsers), use browser HTTP cache instead of IndexedDB
  if (isIOS()) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      await fetch(url, { 
        method: 'GET',
        cache: 'force-cache', // Use browser's HTTP cache
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('🍎 iOS prefetch (browser cache):', url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('/') + 30));
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('iOS prefetch timeout (30s):', url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('/') + 30));
      } else {
        console.error('iOS prefetch failed:', error);
      }
    }
    return;
  }
  
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
    
    // Fetch and cache with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    
    const blob = await response.blob();
    const mimeType = response.headers.get('content-type') || blob.type;
    
    await setCachedBlob(url, blob, mimeType);
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.error('Prefetch timeout (30s)');
    } else {
      console.error('Error prefetching media:', error);
    }
  }
}

// Fetch and cache media (creates blob URL for immediate use)
export async function fetchAndCacheMedia(url: string): Promise<string> {
  console.log('📥 fetchAndCacheMedia called for:', url.substring(0, 100));
  
  // On iOS (all browsers), bypass caching entirely and stream directly
  const iosDetected = isIOS();
  console.log(`🔍 iOS Detection: ${iosDetected} | UA: ${navigator.userAgent.substring(0, 100)}`);
  
  if (iosDetected) {
    console.log('🍎 iOS detected (any browser) - streaming media directly (no cache)');
    return url;
  }
  
  // Check cache first
  console.log('💾 Checking cache...');
  const cached = await getCachedBlob(url);
  if (cached) {
    console.log('✓ Found in cache');
    return cached;
  }
  
  // Fetch from network with timeout
  console.log('🌐 Fetching from network...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    
    const blob = await response.blob();
    const mimeType = response.headers.get('content-type') || blob.type;
    
    // Verify blob is valid before caching
    if (blob.size === 0) {
      console.warn('⚠️ Received empty blob, using original URL');
      return url;
    }
    
    console.log(`✓ Fetched ${(blob.size / 1024).toFixed(2)} KB, caching...`);
    
    // Cache the blob
    await setCachedBlob(url, blob, mimeType);
    
    // Return object URL
    const objectUrl = URL.createObjectURL(blob);
    console.log(`✓ Created blob URL: ${objectUrl}`);
    return objectUrl;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.error('❌ Media fetch timeout (30s)');
    } else {
      console.error('❌ Error fetching media:', error);
    }
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
