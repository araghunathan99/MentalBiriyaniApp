import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import ReelsFeed from "@/components/ReelsFeed";
import GridView from "@/components/GridView";
import BottomNav from "@/components/BottomNav";
import type { MediaItem } from "@shared/schema";
import { getCachedMedia, setCachedMedia, isCacheValid } from "@/lib/mediaCache";

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

export default function Home() {
  const [activeTab, setActiveTab] = useState<"reels" | "grid">("reels");
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [libraryViewerIndex, setLibraryViewerIndex] = useState<number | null>(null);

  // Check for cached media on mount
  const cachedMedia = getCachedMedia();
  const cacheValid = isCacheValid(24 * 60 * 60 * 1000); // 24 hours

  const { data: media = cachedMedia || [], isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ["/api/media"],
    initialData: cacheValid && cachedMedia ? cachedMedia : undefined,
    staleTime: cacheValid ? 5 * 60 * 1000 : 0, // 5 minutes if cache is valid
  });

  // Cache the media data when it's fetched
  useEffect(() => {
    if (media && media.length > 0 && !isLoading) {
      const cached = setCachedMedia(media);
      if (cached) {
        console.log(`✓ Media cached: ${media.length} items`);
      }
    }
  }, [media, isLoading]);

  // Log cache status on mount
  useEffect(() => {
    if (cacheValid && cachedMedia) {
      console.log(`✓ Using cached media: ${cachedMedia.length} items (cache valid)`);
    }
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
        <h2 className="text-xl font-semibold text-foreground mb-2">Connection error</h2>
        <p className="text-muted-foreground mb-4">
          Failed to load media. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2"
          data-testid="button-retry"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Library viewer mode with screen rotation support
  if (activeTab === "grid" && libraryViewerIndex !== null) {
    const currentMedia = media[libraryViewerIndex];
    const hasPrevious = libraryViewerIndex > 0;
    const hasNext = libraryViewerIndex < media.length - 1;

    const LibraryMediaViewer = () => {
      const videoRef = useRef<HTMLVideoElement>(null);
      const imageRef = useRef<HTMLImageElement>(null);

      useEffect(() => {
        const handleOrientationLock = () => {
          if (!('orientation' in screen) || !screen.orientation) return;
          
          const checkAndLockOrientation = (element: HTMLVideoElement | HTMLImageElement | null) => {
            if (!element) return;
            
            const aspectRatio = element.videoWidth 
              ? element.videoWidth / element.videoHeight 
              : element.naturalWidth / element.naturalHeight;
            
            if (aspectRatio > 1) {
              screen.orientation.lock('landscape').catch(() => {});
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
        <>
          {currentMedia.isImage && (
            <img
              ref={imageRef}
              src={currentMedia.webContentLink || currentMedia.webViewLink || ""}
              alt={currentMedia.name}
              className="max-w-full max-h-full object-contain"
              data-testid={`img-library-media-${currentMedia.id}`}
            />
          )}
          {currentMedia.isVideo && (
            <video
              ref={videoRef}
              src={currentMedia.webContentLink || currentMedia.webViewLink || ""}
              controls
              autoPlay
              muted
              className="max-w-full max-h-full"
              data-testid={`video-library-media-${currentMedia.id}`}
            />
          )}
        </>
      );
    };

    return (
      <div className="h-screen w-full bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center overflow-auto p-4">
          <LibraryMediaViewer />
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBackToLibrary}
            className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md hover-elevate active-elevate-2"
            data-testid="button-back-to-library"
          >
            Back to Library
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMedia}
              disabled={!hasPrevious}
              className={`px-4 py-2 text-sm font-medium rounded-md hover-elevate active-elevate-2 ${
                hasPrevious
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground bg-secondary/50 cursor-not-allowed"
              }`}
              data-testid="button-previous-media"
            >
              Previous
            </button>
            <button
              onClick={handleNextMedia}
              disabled={!hasNext}
              className={`px-4 py-2 text-sm font-medium rounded-md hover-elevate active-elevate-2 ${
                hasNext
                  ? "text-foreground bg-secondary"
                  : "text-muted-foreground bg-secondary/50 cursor-not-allowed"
              }`}
              data-testid="button-next-media"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      <div className="h-full pb-14">
        {activeTab === "reels" ? (
          <ReelsFeed media={media} initialIndex={selectedMediaIndex} />
        ) : (
          <GridView media={media} onMediaClick={handleMediaClick} />
        )}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
