import { useState, useEffect, useRef } from "react";
import { Heart, Share2, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleMediaLike, isMediaLiked } from "@/lib/localStorage";
import type { MediaItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/contexts/AudioContext";
import { fetchAndCacheMedia, prefetchMedia } from "@/lib/mediaBlobCache";

interface ReelsFeedProps {
  media: MediaItem[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}

export default function ReelsFeed({ media, initialIndex = 0, onIndexChange }: ReelsFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  // iOS requires videos to be muted for autoplay to work
  const [isMuted, setIsMuted] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(null);
  const isTransitioningRef = useRef(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [cachedMediaUrl, setCachedMediaUrl] = useState<string>("");
  const cachedBlobRef = useRef<string | null>(null);
  const hasTriedFallbackRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefetchedRef = useRef<Set<number>>(new Set());
  const { toast } = useToast();
  const audio = useAudio();

  const currentMedia = media[currentIndex];

  // Notify parent of index changes
  useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  // Load cached media URL when current media changes
  useEffect(() => {
    console.log(`🎬 ReelsFeed: Loading media at index ${currentIndex}:`, currentMedia?.name);
    
    // Reset fallback tracker for new media
    hasTriedFallbackRef.current = false;
    
    if (!currentMedia?.webContentLink) {
      console.warn('⚠️ No webContentLink for current media');
      toast({
        title: "No Media Link",
        description: `No URL for media at index ${currentIndex}`,
        variant: "destructive",
      });
      // Revoke previous blob URL
      if (cachedBlobRef.current && cachedBlobRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(cachedBlobRef.current);
        cachedBlobRef.current = null;
      }
      setCachedMediaUrl("");
      return;
    }

    let cancelled = false;
    
    console.log(`📥 Fetching media: ${currentMedia.webContentLink.substring(0, 100)}`);
    
    fetchAndCacheMedia(currentMedia.webContentLink)
      .then((url) => {
        if (!cancelled) {
          console.log(`✓ Media loaded successfully for index ${currentIndex}`);
          console.log(`   URL type: ${url.startsWith('blob:') ? 'blob URL' : 'direct URL'}`);
          
          // Revoke previous blob URL before setting new one
          if (cachedBlobRef.current && cachedBlobRef.current.startsWith('blob:') && cachedBlobRef.current !== url) {
            URL.revokeObjectURL(cachedBlobRef.current);
          }
          
          cachedBlobRef.current = url;
          setCachedMediaUrl(url);
        } else {
          console.log('⚠️ Fetch was cancelled before completion');
          // If cancelled, revoke the new URL we just created
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        }
      })
      .catch((error) => {
        console.error(`❌ Error loading media at index ${currentIndex}:`, error);
        if (!cancelled) {
          console.log('⚠️ Falling back to original URL');
          toast({
            title: "Media Load Error",
            description: `Failed to load item ${currentIndex + 1}. Trying fallback...`,
            variant: "destructive",
          });
          setCachedMediaUrl(currentMedia.webContentLink || "");
        }
      });

    return () => {
      cancelled = true;
      if (cachedBlobRef.current && cachedBlobRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(cachedBlobRef.current);
        cachedBlobRef.current = null;
      }
    };
  }, [currentMedia?.webContentLink, currentIndex, media.length, toast]);

  // Start background music when component mounts
  useEffect(() => {
    // Start playing if first media is not a video
    if (!currentMedia?.isVideo) {
      console.log('🎵 Starting audio for photo on mount');
      audio.play();
    } else {
      console.log('🎵 First media is video, not starting audio');
    }
  }, []);

  // Manage background music based on media type
  useEffect(() => {
    if (!currentMedia) return;

    if (currentMedia.isVideo) {
      // Pause background music when showing a video
      if (audio.isPlaying) {
        audio.pause();
        console.log('🎵 Paused background music for video');
      }
    } else if (currentMedia.isImage) {
      // Resume background music when showing a photo
      if (!audio.isPlaying) {
        audio.resume();
        console.log('🎵 Resumed background music for photo');
      }
    }
  }, [currentMedia?.id, currentMedia?.isVideo, currentMedia?.isImage]);

  // Prefetch next media items (reduced for iOS memory management)
  useEffect(() => {
    // Detect iOS for conservative prefetching
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const prefetchCount = isIOS ? 3 : 10; // Reduced prefetch for iOS
    

    const prefetchNextItems = async () => {
      const itemsToPrefetch: number[] = [];
      
      // Get indices for next items (wrapping around if needed)
      for (let i = 1; i <= prefetchCount; i++) {
        const nextIndex = (currentIndex + i) % media.length;
        if (!prefetchedRef.current.has(nextIndex)) {
          itemsToPrefetch.push(nextIndex);
        }
      }

      if (itemsToPrefetch.length > 0) {
        console.log(`🔄 Prefetching ${itemsToPrefetch.length} items from index ${currentIndex}:`, itemsToPrefetch);
      }

      // Mark items as being prefetched IMMEDIATELY to prevent duplicate requests
      itemsToPrefetch.forEach(index => prefetchedRef.current.add(index));

      // Prefetch in parallel using cache system (no blob URLs created)
      const prefetchPromises = itemsToPrefetch.map(async (index) => {
        const item = media[index];
        if (!item) return;

        try {
          if (item.webContentLink) {
            // Prefetch media (caches without creating blob URL)
            await prefetchMedia(item.webContentLink);
            console.log(`✓ Prefetched ${item.isVideo ? 'video' : 'image'} index ${index}: ${item.name}`);
          }
          if (item.thumbnailLink && item.thumbnailLink !== item.webContentLink) {
            // Also prefetch thumbnail if different
            await prefetchMedia(item.thumbnailLink);
            console.log(`✓ Prefetched thumbnail index ${index}: ${item.name}`);
          }
        } catch (error) {
          console.error(`Failed to prefetch item at index ${index}:`, error);
        }
      });

      await Promise.all(prefetchPromises);
    };

    prefetchNextItems();
  }, [currentIndex, media]);

  useEffect(() => {
    if (currentMedia) {
      setIsLiked(isMediaLiked(currentMedia.id));
      setHasError(false);
      setIsBuffering(false);
    }
  }, [currentMedia]);

  // Handle video buffering and error states
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentMedia?.isVideo) return;

    const handleWaiting = () => {
      console.log('📹 Video buffering...');
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      console.log('✓ Video can play');
      setIsBuffering(false);
      setHasError(false);
    };

    const handleLoadedData = () => {
      console.log('✓ Video data loaded');
      setIsBuffering(false);
      // iOS-specific: Attempt to play after data is loaded
      if (isPlaying && video.paused) {
        video.play().catch((error) => {
          console.warn('iOS autoplay prevented:', error);
          // Autoplay was prevented, will require user interaction
        });
      }
    };

    const handleError = (e: Event) => {
      console.error('✗ Video error:', e);
      
      // Only show error if we've already tried the fallback URL
      if (hasTriedFallbackRef.current) {
        setHasError(true);
        setIsBuffering(false);
        toast({
          title: "Video Error",
          description: "Failed to load video. Please try the next one.",
          variant: "destructive",
        });
      } else {
        console.log('⚠️ First error - will try fallback if blob URL');
      }
    };

    const handleStalled = () => {
      console.warn('⚠️ Video stalled');
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      console.log('▶️ Video playing');
      setIsBuffering(false);
    };

    const handleSuspend = () => {
      console.log('📹 Video suspended (iOS optimization)');
      // iOS may suspend video loading, this is normal
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('suspend', handleSuspend);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('suspend', handleSuspend);
    };
  }, [currentMedia, toast, isPlaying]);

  // Auto screen rotation based on media aspect ratio
  useEffect(() => {
    const handleOrientationLock = async () => {
      // Check if screen orientation API is fully supported (not on iOS)
      if (!('orientation' in screen) || !screen.orientation || typeof (screen.orientation as any).lock !== 'function') {
        return; // Skip on iOS and unsupported browsers
      }
      
      const checkAndLockOrientation = (element: HTMLVideoElement | HTMLImageElement | null) => {
        if (!element) return;
        
        let aspectRatio = 1;
        if (element instanceof HTMLVideoElement) {
          aspectRatio = element.videoWidth / element.videoHeight;
        } else if (element instanceof HTMLImageElement) {
          aspectRatio = element.naturalWidth / element.naturalHeight;
        }
        
        // If landscape media (width > height), suggest landscape orientation
        if (aspectRatio > 1) {
          (screen.orientation as any).lock('landscape').catch(() => {
            // Orientation lock may fail on some devices/browsers
          });
        } else {
          // Portrait or square media, unlock to allow natural orientation
          if (typeof (screen.orientation as any).unlock === 'function') {
            try {
              (screen.orientation as any).unlock();
            } catch (e) {
              // Unlock may fail on some browsers
            }
          }
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
      // Unlock orientation when component unmounts
      if ('orientation' in screen && screen.orientation && typeof screen.orientation.unlock === 'function') {
        try {
          screen.orientation.unlock();
        } catch (e) {
          // Unlock may fail on some browsers (especially iOS)
        }
      }
    };
  }, [currentMedia]);

  useEffect(() => {
    if (videoRef.current && currentMedia?.isVideo) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentMedia]);

  useEffect(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    const timeoutId = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    controlsTimeoutRef.current = timeoutId;

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = undefined;
      }
    };
  }, [currentIndex]);

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, media.length]);

  // Scroll/wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        handleNext();
      } else if (e.deltaY < 0) {
        handlePrevious();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [currentIndex, media.length]);

  // Video progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentMedia?.isVideo) return;

    const updateProgress = () => {
      if (!isDraggingProgress) {
        const progress = (video.currentTime / video.duration) * 100;
        setVideoProgress(progress || 0);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, [currentMedia, isDraggingProgress]);

  const handleNext = () => {
    if (isTransitioningRef.current) return;
    
    isTransitioningRef.current = true;
    setCurrentIndex((prev) => {
      const next = (prev + 1) % media.length;
      console.log(`➡️ Next: ${prev} → ${next} | ${media[next]?.name}`);
      return next;
    });
    setSlideDirection('down');
    
    setTimeout(() => {
      setSlideDirection(null);
      isTransitioningRef.current = false;
    }, 200);
  };

  const handlePrevious = () => {
    if (isTransitioningRef.current) return;
    
    isTransitioningRef.current = true;
    setCurrentIndex((prev) => {
      const next = (prev - 1 + media.length) % media.length;
      console.log(`⬅️ Previous: ${prev} → ${next} | ${media[next]?.name}`);
      return next;
    });
    setSlideDirection('up');
    
    setTimeout(() => {
      setSlideDirection(null);
      isTransitioningRef.current = false;
    }, 200);
  };

  const handleLike = () => {
    const newLiked = toggleMediaLike(currentMedia.id);
    setIsLiked(newLiked);
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${currentMedia.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentMedia.name,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        description: "Link copied to clipboard!",
        duration: 2000,
      });
    }
  };

  const handleTap = () => {
    if (showControls) {
      // If controls are showing, hide them on tap
      setShowControls(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = undefined;
      }
    } else {
      // If controls are hidden, show them
      if (currentMedia?.isVideo) {
        setIsPlaying(!isPlaying);
      }
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      const timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      controlsTimeoutRef.current = timeoutId;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioningRef.current || isDraggingProgress) return;
    setTouchStart(e.targetTouches[0].clientY);
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTransitioningRef.current || isDraggingProgress) return;
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentY);
  };

  const handleTouchEnd = () => {
    if (isTransitioningRef.current || isDraggingProgress) return;
    
    const swipeDistance = touchStart - touchEnd;
    
    // Reduced threshold for faster, more responsive swipes (50px)
    // Ignore very small movements (likely accidental touches)
    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0) {
        // Swipe up - show next
        handleNext();
      } else {
        // Swipe down - show previous
        handlePrevious();
      }
    }
    
    // Reset touch values
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !currentMedia?.isVideo) return;
    
    const duration = videoRef.current.duration;
    if (!isFinite(duration) || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * duration;
    
    if (isFinite(newTime)) {
      videoRef.current.currentTime = newTime;
      setVideoProgress(percentage);
    }
  };

  const handleProgressTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingProgress(true);
    // Immediately update position on touch start
    const duration = videoRef.current?.duration;
    if (!videoRef.current || !currentMedia?.isVideo || !duration || !isFinite(duration) || duration === 0) return;
    
    const progressBar = document.getElementById('video-progress-bar');
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clientX = e.touches[0].clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * duration;
    
    if (isFinite(newTime)) {
      setVideoProgress(percentage);
      videoRef.current.currentTime = newTime;
    }
  };

  const handleProgressDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingProgress(true);
  };

  const handleProgressDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingProgress || !videoRef.current || !currentMedia?.isVideo) return;
    
    const duration = videoRef.current.duration;
    if (!isFinite(duration) || duration === 0) return;
    
    const progressBar = document.getElementById('video-progress-bar');
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * duration;
    
    if (isFinite(newTime)) {
      setVideoProgress(percentage);
      videoRef.current.currentTime = newTime;
    }
  };

  const handleProgressDragEnd = () => {
    setIsDraggingProgress(false);
  };

  useEffect(() => {
    if (isDraggingProgress) {
      window.addEventListener('mousemove', handleProgressDrag);
      window.addEventListener('mouseup', handleProgressDragEnd);
      window.addEventListener('touchmove', handleProgressDrag);
      window.addEventListener('touchend', handleProgressDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleProgressDrag);
        window.removeEventListener('mouseup', handleProgressDragEnd);
        window.removeEventListener('touchmove', handleProgressDrag);
        window.removeEventListener('touchend', handleProgressDragEnd);
      };
    }
  }, [isDraggingProgress]);

  if (!currentMedia) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {currentMedia.isVideo ? (
        <>
          <video
            key={currentIndex}
            ref={videoRef}
            src={cachedMediaUrl || currentMedia.webContentLink}
            className={`w-full h-full object-contain transition-all duration-200 ${
              slideDirection === 'down' ? 'animate-slide-up' : 
              slideDirection === 'up' ? 'animate-slide-down' : 
              'opacity-100'
            }`}
            loop
            muted={isMuted}
            playsInline
            autoPlay
            preload="auto"
            crossOrigin="anonymous"
            onClick={handleTap}
            onDoubleClick={handleDoubleTap}
            onError={(e) => {
              // iOS blob URL fallback: if blob URL fails, try original URL
              if (cachedMediaUrl && cachedMediaUrl.startsWith('blob:') && cachedMediaUrl !== currentMedia.webContentLink) {
                console.warn('⚠️ Blob URL failed, falling back to original URL');
                hasTriedFallbackRef.current = true;
                setCachedMediaUrl(currentMedia.webContentLink || "");
              } else {
                hasTriedFallbackRef.current = true;
              }
            }}
            data-testid="video-player"
          />
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white p-4">
                <p className="text-lg font-semibold">Video Failed to Load</p>
                <p className="text-sm opacity-70 mt-2">Swipe to next video</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <img
          key={currentIndex}
          ref={imageRef}
          src={cachedMediaUrl || currentMedia.webContentLink}
          alt={currentMedia.name}
          className={`w-full h-full object-contain transition-all duration-200 ${
            slideDirection === 'down' ? 'animate-slide-up' : 
            slideDirection === 'up' ? 'animate-slide-down' : 
            'opacity-100'
          }`}
          onClick={handleTap}
          onDoubleClick={handleDoubleTap}
          decoding="async"
          loading="eager"
          onError={(e) => {
            // iOS blob URL fallback: if blob URL fails, try original URL
            if (cachedMediaUrl && cachedMediaUrl.startsWith('blob:') && cachedMediaUrl !== currentMedia.webContentLink) {
              console.warn('⚠️ Image blob URL failed, falling back to original URL');
              setCachedMediaUrl(currentMedia.webContentLink || "");
            }
          }}
          data-testid="image-viewer"
        />
      )}

      <div 
        className={`absolute top-0 left-0 right-0 p-4 pt-safe bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-white text-sm font-medium truncate" data-testid="text-media-name">{currentMedia.name}</p>
            <p className="text-white/70 text-xs" data-testid="text-media-time">
              {currentMedia.modifiedTime ? new Date(currentMedia.modifiedTime).toLocaleDateString() : ""}
            </p>
          </div>
        </div>
      </div>

      <div className={`absolute right-4 bottom-24 flex flex-col gap-6 transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col items-center">
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-full bg-transparent text-white hover:scale-110 transition-transform no-default-hover-elevate"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            data-testid="button-like"
          >
            <Heart className={`h-7 w-7 ${isLiked ? "fill-destructive text-destructive" : ""}`} />
          </Button>
          {isLiked && <span className="text-white text-xs mt-1" data-testid="text-liked">Liked</span>}
        </div>

        <div className="flex flex-col items-center">
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-full bg-transparent text-white hover:scale-110 transition-transform no-default-hover-elevate"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            data-testid="button-share"
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>

        {currentMedia.isVideo && (
          <div className="flex flex-col items-center">
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 rounded-full bg-transparent text-white hover:scale-110 transition-transform no-default-hover-elevate"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              data-testid="button-mute"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          </div>
        )}
      </div>

      {currentMedia.isVideo && (
        <div className={`absolute left-0 right-0 bottom-16 px-4 transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          {/* Larger touch area for mobile */}
          <div className="py-3 -my-3">
            <div
              id="video-progress-bar"
              className="relative h-1 bg-white/30 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
              onTouchStart={handleProgressTouchStart}
              data-testid="video-progress-bar"
            >
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                style={{ width: `${videoProgress}%` }}
              />
              {/* Always visible handle on mobile, hover-visible on desktop */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                style={{ left: `${videoProgress}%`, transform: 'translate(-50%, -50%)' }}
                onMouseDown={handleProgressDragStart}
                data-testid="video-progress-handle"
              />
            </div>
          </div>
        </div>
      )}

      <div className={`absolute left-0 right-0 bottom-0 p-4 pb-safe bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex items-center justify-center gap-2 relative">
          {/* Left click zone for previous */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            data-testid="button-previous-zone"
          />
          
          <div className="flex gap-1">
            {media.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-200 ${
                  idx === currentIndex ? "bg-white w-6" : "bg-white/40 w-1"
                }`}
              />
            ))}
          </div>
          
          {/* Right click zone for next */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            data-testid="button-next-zone"
          />
        </div>
      </div>

      {!currentMedia.isVideo && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="icon"
            variant="ghost"
            className="h-16 w-16 rounded-full bg-black/40 text-white"
            data-testid="button-play"
          >
            <Play className="h-8 w-8" />
          </Button>
        </div>
      )}
    </div>
  );
}
