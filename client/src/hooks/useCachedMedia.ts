import { useState, useEffect, useRef } from 'react';
import { fetchAndCacheMedia } from '@/lib/mediaBlobCache';

/**
 * Hook to load media with caching support
 * Returns cached media URL if available, otherwise fetches and caches
 */
export function useCachedMedia(url: string | undefined): string | undefined {
  const [cachedUrl, setCachedUrl] = useState<string | undefined>(url);
  const [isLoading, setIsLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!url) {
      // Revoke previous blob URL if exists
      if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setCachedUrl(undefined);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchAndCacheMedia(url)
      .then((newCachedUrl) => {
        if (!cancelled) {
          // Revoke previous blob URL before setting new one
          if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:') && blobUrlRef.current !== newCachedUrl) {
            URL.revokeObjectURL(blobUrlRef.current);
          }
          
          blobUrlRef.current = newCachedUrl;
          setCachedUrl(newCachedUrl);
          setIsLoading(false);
        } else {
          // If cancelled, revoke the new URL we just created
          if (newCachedUrl && newCachedUrl.startsWith('blob:')) {
            URL.revokeObjectURL(newCachedUrl);
          }
        }
      })
      .catch((error) => {
        console.error('Error loading cached media:', error);
        if (!cancelled) {
          // Fallback to original URL
          setCachedUrl(url);
          setIsLoading(false);
        }
      });

    // Cleanup: revoke object URL when component unmounts or URL changes
    return () => {
      cancelled = true;
      if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [url]);

  return cachedUrl;
}
