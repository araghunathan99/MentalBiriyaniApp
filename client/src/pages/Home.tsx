import { useState, useEffect, useRef } from "react";
import ReelsFeed from "@/components/ReelsFeed";
import GridView from "@/components/GridView";
import BottomNav from "@/components/BottomNav";
import type { MediaItem } from "@shared/schema";
import { getCachedMedia, setCachedMedia, isCacheValid } from "@/lib/mediaCache";
import { fetchLocalMedia } from "@/lib/localMedia";
import { Button } from "@/components/ui/button";
import { isMediaLiked } from "@/lib/localStorage";
import { ArrowLeft } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"reels" | "grid">("reels");
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [libraryViewerIndex, setLibraryViewerIndex] = useState<number | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [shuffledMedia, setShuffledMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setError('No media found in content folder');
          setIsLoading(false);
          return;
        }

        setMedia(mediaItems);
        setShuffledMedia(shuffleArray(mediaItems));
        setCachedMedia(mediaItems);
        console.log(`✓ Loaded ${mediaItems.length} items from content folder`);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading media:', err);
        setError('Failed to load media from content folder');
        setIsLoading(false);
      }
    }

    loadMedia();
  }, []);

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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
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
      }, []);

      return (
        <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-auto p-4">
          {currentMedia.isImage && (
            <img
              ref={imageRef}
              src={currentMedia.webContentLink}
              alt={currentMedia.name}
              className="max-w-full max-h-full object-contain"
              data-testid={`img-library-media-${currentMedia.id}`}
            />
          )}
          {currentMedia.isVideo && (
            <video
              ref={videoRef}
              src={currentMedia.webContentLink}
              controls
              autoPlay
              muted
              playsInline
              loop
              className="max-w-full max-h-full"
              data-testid={`video-library-media-${currentMedia.id}`}
              onError={(e) => {
                console.error('Video playback error:', e);
              }}
            />
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

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <div className="h-full pb-14">
        {activeTab === "reels" ? (
          <ReelsFeed media={shuffledMedia} initialIndex={selectedMediaIndex} />
        ) : (
          <GridView media={sortByFavorites(media)} onMediaClick={handleMediaClick} />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
