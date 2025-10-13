import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import ReelsFeed from "@/components/ReelsFeed";
import GridView from "@/components/GridView";
import BottomNav from "@/components/BottomNav";
import type { MediaItem } from "@shared/schema";
import { getCachedMedia, setCachedMedia, isCacheValid } from "@/lib/mediaCache";
import { fetchLocalMedia } from "@/lib/localMedia";
import { getStorageQuota, fetchAndCacheMedia } from "@/lib/mediaBlobCache";
import { Button } from "@/components/ui/button";
import { isMediaLiked } from "@/lib/localStorage";
import { ArrowLeft } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

// TODO: remove mock functionality
const mockMedia: MediaItem[] = [
  {
    id: "1",
    name: "Sunset Beach Video",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    webViewLink: "#",
    modifiedTime: new Date().toISOString(),
    size: "2048000",
    isVideo: true,
    isImage: false,
  },
  {
    id: "2",
    name: "Mountain Landscape",
    mimeType: "image/jpeg",
    thumbnailLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    webContentLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    webViewLink: "#",
    modifiedTime: new Date(Date.now() - 86400000).toISOString(),
    size: "1024000",
    isVideo: false,
    isImage: true,
  },
  {
    id: "3",
    name: "City Timelapse",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    webViewLink: "#",
    modifiedTime: new Date(Date.now() - 172800000).toISOString(),
    size: "3072000",
    isVideo: true,
    isImage: false,
  },
  {
    id: "4",
    name: "Forest Trail",
    mimeType: "image/jpeg",
    thumbnailLink: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    webContentLink: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    webViewLink: "#",
    modifiedTime: new Date(Date.now() - 259200000).toISOString(),
    size: "1536000",
    isVideo: false,
    isImage: true,
  },
  {
    id: "5",
    name: "Ocean Waves",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    webViewLink: "#",
    modifiedTime: new Date(Date.now() - 345600000).toISOString(),
    size: "2560000",
    isVideo: true,
    isImage: false,
  },
  {
    id: "6",
    name: "Northern Lights",
    mimeType: "image/jpeg",
    thumbnailLink: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800",
    webContentLink: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800",
    webViewLink: "#",
    modifiedTime: new Date(Date.now() - 432000000).toISOString(),
    size: "2048000",
    isVideo: false,
    isImage: true,
  },
  {
    id: "7",
    name: "Desert Sunset",
    mimeType: "image/jpeg",
    thumbnailLink: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800",
    webContentLink: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800",
    webViewLink: "#",
    modifiedTime: new Date(Date.now() - 518400000).toISOString(),
    size: "1792000",
    isVideo: false,
    isImage: true,
  },
  {
    id: "8",
    name: "Waterfall",
    mimeType: "video/mp4",
    thumbnailLink: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=400",
    webContentLink: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    webViewLink: "#",
    modifiedTime: new Date(Date.now() - 604800000).toISOString(),
    size: "3584000",
    isVideo: true,
    isImage: false,
  },
  {
    id: "9",
    name: "Snowy Mountains",
    mimeType: "image/jpeg",
    thumbnailLink: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800",
    webContentLink: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800",
    webViewLink: "#",
    modifiedTime: new Date(Date.now() - 691200000).toISOString(),
    size: "2304000",
    isVideo: false,
    isImage: true,
  },
];

// Fisher-Yates shuffle algorithm to randomize array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sort media by favorites (liked items first)
function sortByFavorites(mediaItems: MediaItem[]): MediaItem[] {
  return [...mediaItems].sort((a, b) => {
    const aLiked = isMediaLiked(a.id);
    const bLiked = isMediaLiked(b.id);
    
    if (aLiked && !bLiked) return -1;
    if (!aLiked && bLiked) return 1;
    return 0;
  });
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"reels" | "grid">("reels");
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [reelsPosition, setReelsPosition] = useState(0);
  const [libraryViewerIndex, setLibraryViewerIndex] = useState<number | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [shuffledMedia, setShuffledMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audio = useAudio();
  const wasPlayingBeforeLibraryRef = useRef(false);
  const initialLoadRef = useRef(true);

  // Redirect to landing page on hard refresh (skip on direct navigation from landing)
  useEffect(() => {
    const SESSION_KEY = 'mental-biriyani-session-active';
    
    // iOS Safari Private Mode workaround: use a global flag
    const hasNavigatedFromLanding = (window as any).__fromLanding;
    
    // Check if this is a fresh page load (hard refresh)
    let isSessionActive = null;
    try {
      isSessionActive = sessionStorage.getItem(SESSION_KEY);
      console.log('🔍 Home: Checking session storage, value:', isSessionActive);
    } catch (error) {
      console.error('❌ Home: Failed to read session storage:', error);
      // If sessionStorage fails (iOS Private Mode), check global flag
      if (hasNavigatedFromLanding) {
        console.log('✅ Home: Using fallback flag (iOS Private Mode)');
        return;
      }
    }
    
    if (!isSessionActive && !hasNavigatedFromLanding) {
      // First time loading the app in this session - redirect to landing
      console.log('🔄 Home: No session found, redirecting to landing page');
      setLocation('/');
      return;
    }
    
    // Session is active or came from landing, continue loading
    console.log('✅ Home: Session active or came from landing, loading home page');
  }, [setLocation]);

  // Load media from local content folder
  useEffect(() => {
    async function loadMedia() {
      try {
        // Check cache first
        const cachedMedia = getCachedMedia();
        const cacheValid = isCacheValid(24 * 60 * 60 * 1000); // 24 hours
        
        if (cacheValid && cachedMedia && cachedMedia.length > 0) {
          console.log(`✓ Using cached media: ${cachedMedia.length} items`);
          setMedia(cachedMedia);
          setShuffledMedia(shuffleArray(cachedMedia));
          setIsLoading(false);
          return;
        }

        // Fetch from local content folder
        const mediaItems = await fetchLocalMedia();
        
        if (mediaItems.length === 0) {
          // Use mock data as fallback for testing
          console.log('⚠️  No media found, using mock data for testing');
          setMedia(mockMedia);
          setShuffledMedia(shuffleArray(mockMedia));
          setCachedMedia(mockMedia);
          setIsLoading(false);
          return;
        }

        setMedia(mediaItems);
        setShuffledMedia(shuffleArray(mediaItems));
        setCachedMedia(mediaItems);
        console.log(`✓ Loaded ${mediaItems.length} items from content folder`);
        
        // Show available storage quota
        await getStorageQuota();
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading media:', err);
        // Use mock data as fallback
        console.log('⚠️  Error loading media, using mock data for testing');
        setMedia(mockMedia);
        setShuffledMedia(shuffleArray(mockMedia));
        setCachedMedia(mockMedia);
        setIsLoading(false);
      }
    }

    loadMedia();
  }, []);

  // Handle tab changes to pause/resume audio
  useEffect(() => {
    if (activeTab === "grid") {
      // Switching to library - pause reels audio if playing
      if (audio.isPlaying) {
        wasPlayingBeforeLibraryRef.current = true;
        audio.pause();
        console.log('🎵 Paused reels audio for library view');
      }
    } else if (activeTab === "reels") {
      // Switching back to reels - resume if was playing before
      if (wasPlayingBeforeLibraryRef.current && !audio.isPlaying) {
        audio.resume();
        wasPlayingBeforeLibraryRef.current = false;
        console.log('🎵 Resumed reels audio from library view');
      }
    }
  }, [activeTab, audio]);

  // Handle browser back button
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      
      // Priority order for back button:
      // 1. If in library viewer mode, go back to library grid
      if (libraryViewerIndex !== null) {
        setLibraryViewerIndex(null);
        return;
      }
      
      // 2. If in library tab (not All filter), go to All filter
      // (This would require tracking the filter state, which is in GridView)
      
      // 3. If in reels view and not at first item, go to previous reel
      if (activeTab === "reels" && reelsPosition > 0) {
        setReelsPosition(prev => Math.max(0, prev - 1));
        return;
      }
      
      // 4. If in library tab, switch to reels view
      if (activeTab === "grid") {
        setActiveTab("reels");
        return;
      }
      
      // 5. Default: go to landing page
      window.history.go(-1);
    };

    // Push state on initial load to enable back button
    if (initialLoadRef.current) {
      window.history.pushState({ page: 'home' }, '', '');
      initialLoadRef.current = false;
    }

    window.addEventListener('popstate', handleBackButton);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [activeTab, reelsPosition, libraryViewerIndex]);

  const handleMediaClick = (index: number) => {
    if (activeTab === "grid") {
      setLibraryViewerIndex(index);
    } else {
      setSelectedMediaIndex(index);
      setActiveTab("reels");
    }
  };

  const handleBackToLibrary = () => {
    setLibraryViewerIndex(null);
  };

  const handlePreviousMedia = () => {
    if (libraryViewerIndex !== null && libraryViewerIndex > 0) {
      setLibraryViewerIndex(libraryViewerIndex - 1);
    }
  };

  const handleNextMedia = () => {
    if (libraryViewerIndex !== null && libraryViewerIndex < media.length - 1) {
      setLibraryViewerIndex(libraryViewerIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading your memories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">
          {error}
        </p>
        <Button
          onClick={() => window.location.reload()}
          data-testid="button-retry"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Library viewer mode with swipe and arrow controls
  if (activeTab === "grid" && libraryViewerIndex !== null) {
    const sortedMedia = sortByFavorites(media);
    const currentMedia = sortedMedia[libraryViewerIndex];
    const hasPrevious = libraryViewerIndex > 0;
    const hasNext = libraryViewerIndex < sortedMedia.length - 1;

    const LibraryMediaViewer = () => {
      const videoRef = useRef<HTMLVideoElement>(null);
      const imageRef = useRef<HTMLImageElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const touchStartRef = useRef<{ x: number; y: number } | null>(null);
      const [cachedMediaUrl, setCachedMediaUrl] = useState<string>("");
      const [isLoadingMedia, setIsLoadingMedia] = useState(true);
      const [hasMediaError, setHasMediaError] = useState(false);
      const cachedBlobRef = useRef<string | null>(null);

      // Load cached media URL when current media changes
      useEffect(() => {
        if (!currentMedia?.webContentLink) {
          // Revoke previous blob URL
          if (cachedBlobRef.current && cachedBlobRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(cachedBlobRef.current);
            cachedBlobRef.current = null;
          }
          setCachedMediaUrl("");
          setIsLoadingMedia(false);
          return;
        }

        console.log('📚 Library: Loading media', currentMedia.name);
        setIsLoadingMedia(true);
        setHasMediaError(false);
        let cancelled = false;
        
        fetchAndCacheMedia(currentMedia.webContentLink)
          .then((url) => {
            if (!cancelled) {
              // Revoke previous blob URL before setting new one
              if (cachedBlobRef.current && cachedBlobRef.current.startsWith('blob:') && cachedBlobRef.current !== url) {
                URL.revokeObjectURL(cachedBlobRef.current);
              }
              
              cachedBlobRef.current = url;
              setCachedMediaUrl(url);
              setIsLoadingMedia(false);
              console.log('✓ Library: Media loaded', currentMedia.name);
            } else {
              // If cancelled, revoke the new URL we just created
              if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
              }
            }
          })
          .catch((error) => {
            console.error('❌ Library: Error loading cached media:', error);
            if (!cancelled) {
              // Fallback to original URL
              setCachedMediaUrl(currentMedia.webContentLink);
              setIsLoadingMedia(false);
              setHasMediaError(true);
            }
          });

        return () => {
          cancelled = true;
          if (cachedBlobRef.current && cachedBlobRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(cachedBlobRef.current);
            cachedBlobRef.current = null;
          }
        };
      }, [currentMedia?.webContentLink, currentMedia?.name]);

      // Handle swipe gestures for mobile
      useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
          touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        };

        const handleTouchEnd = (e: TouchEvent) => {
          if (!touchStartRef.current) return;

          const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
          const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
          const threshold = 50;

          // Determine if swipe is more vertical or horizontal
          if (Math.abs(deltaY) > Math.abs(deltaX)) {
            // Vertical swipe
            if (deltaY < -threshold && hasNext) {
              // Swipe up = next
              handleNextMedia();
            } else if (deltaY > threshold && hasPrevious) {
              // Swipe down = previous
              handlePreviousMedia();
            }
          } else {
            // Horizontal swipe
            if (deltaX < -threshold && hasNext) {
              // Swipe left = next
              handleNextMedia();
            } else if (deltaX > threshold && hasPrevious) {
              // Swipe right = previous
              handlePreviousMedia();
            }
          }

          touchStartRef.current = null;
        };

        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
          container.removeEventListener('touchstart', handleTouchStart);
          container.removeEventListener('touchend', handleTouchEnd);
        };
      }, [hasNext, hasPrevious]);

      // Handle keyboard arrow controls for web
      useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            if (hasNext) {
              e.preventDefault();
              handleNextMedia();
            }
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            if (hasPrevious) {
              e.preventDefault();
              handlePreviousMedia();
            }
          }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [hasNext, hasPrevious]);

      useEffect(() => {
        const handleOrientationLock = () => {
          if (!('orientation' in screen) || !screen.orientation) return;
          
          const checkAndLockOrientation = (element: HTMLVideoElement | HTMLImageElement | null) => {
            if (!element) return;
            
            let aspectRatio = 1;
            if (element instanceof HTMLVideoElement) {
              aspectRatio = element.videoWidth / element.videoHeight;
            } else if (element instanceof HTMLImageElement) {
              aspectRatio = element.naturalWidth / element.naturalHeight;
            }
            
            if (aspectRatio > 1) {
              (screen.orientation as any).lock('landscape').catch(() => {});
            } else {
              screen.orientation.unlock();
            }
          };

          if (currentMedia?.isVideo && videoRef.current) {
            videoRef.current.addEventListener('loadedmetadata', () => {
              checkAndLockOrientation(videoRef.current);
            });
          } else if (!currentMedia?.isVideo && imageRef.current) {
            imageRef.current.addEventListener('load', () => {
              checkAndLockOrientation(imageRef.current);
            });
          }
        };

        handleOrientationLock();

        return () => {
          if ('orientation' in screen && screen.orientation) {
            screen.orientation.unlock();
          }
        };
      }, [currentMedia?.isVideo]);

      return (
        <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-auto p-4 bg-black">
          {isLoadingMedia && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2" />
                <p className="text-sm text-white">Loading media...</p>
              </div>
            </div>
          )}
          {!isLoadingMedia && cachedMediaUrl && currentMedia.isImage && (
            <img
              ref={imageRef}
              src={cachedMediaUrl}
              alt={currentMedia.name}
              className="max-w-full max-h-full object-contain"
              data-testid={`img-library-media-${currentMedia.id}`}
              onError={(e) => {
                console.error('❌ Library: Image error');
                // iOS blob URL fallback: if blob URL fails, try original URL
                if (cachedMediaUrl && cachedMediaUrl.startsWith('blob:') && cachedMediaUrl !== currentMedia.webContentLink) {
                  console.warn('⚠️ Library: Blob URL failed, falling back to original URL');
                  setCachedMediaUrl(currentMedia.webContentLink);
                } else {
                  setHasMediaError(true);
                }
              }}
            />
          )}
          {!isLoadingMedia && cachedMediaUrl && currentMedia.isVideo && (
            <video
              ref={videoRef}
              src={cachedMediaUrl}
              controls
              autoPlay
              playsInline
              loop
              className="max-w-full max-h-full"
              data-testid={`video-library-media-${currentMedia.id}`}
              onError={(e) => {
                console.error('❌ Library: Video playback error:', e);
                // iOS blob URL fallback: if blob URL fails, try original URL
                if (cachedMediaUrl && cachedMediaUrl.startsWith('blob:') && cachedMediaUrl !== currentMedia.webContentLink) {
                  console.warn('⚠️ Library: Video blob URL failed, falling back to original URL');
                  setCachedMediaUrl(currentMedia.webContentLink);
                } else {
                  setHasMediaError(true);
                }
              }}
            />
          )}
          {hasMediaError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90">
              <div className="text-center text-white p-4">
                <p className="text-lg font-semibold">Media Failed to Load</p>
                <p className="text-sm opacity-70 mt-2">Try the next item</p>
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="h-screen w-full bg-background flex flex-col">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border px-4 py-3">
          <button
            onClick={handleBackToLibrary}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-secondary rounded-md hover-elevate active-elevate-2"
            data-testid="button-back-to-library"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </button>
        </div>
        <LibraryMediaViewer />
      </div>
    );
  }

  // Safeguard: ensure we have media to display
  if (media.length === 0 || shuffledMedia.length === 0) {
    console.error('❌ No media available to display');
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">No Media Found</h2>
        <p className="text-muted-foreground mb-4">
          Unable to load any media content. Please check your connection and try again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          data-testid="button-retry"
        >
          Reload
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <div className="h-full pb-14">
        {activeTab === "reels" ? (
          <ReelsFeed 
            media={shuffledMedia} 
            initialIndex={reelsPosition} 
            onIndexChange={setReelsPosition}
          />
        ) : (
          <GridView media={sortByFavorites(media)} onMediaClick={handleMediaClick} />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
