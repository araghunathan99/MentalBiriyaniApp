import { useState, useEffect, useRef } from "react";
import { Heart, Share2, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleMediaLike, isMediaLiked } from "@/lib/localStorage";
import type { MediaItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAudioPlaylist } from "@/hooks/useAudioPlaylist";

interface ReelsFeedProps {
  media: MediaItem[];
  initialIndex?: number;
}

export default function ReelsFeed({ media, initialIndex = 0 }: ReelsFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [mediaOpacity, setMediaOpacity] = useState(1);
  const isTransitioningRef = useRef(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefetchedRef = useRef<Set<number>>(new Set());
  const { toast } = useToast();
  const audioPlaylist = useAudioPlaylist();

  const currentMedia = media[currentIndex];

  // Start background music when component mounts
  useEffect(() => {
    // Start playing if first media is not a video
    if (!currentMedia?.isVideo) {
      audioPlaylist.play();
    }
  }, []);

  // Manage background music based on media type
  useEffect(() => {
    if (!currentMedia) return;

    if (currentMedia.isVideo) {
      // Pause background music when showing a video
      if (audioPlaylist.isPlaying) {
        audioPlaylist.pause();
        console.log('🎵 Paused background music for video');
      }
    } else if (currentMedia.isImage) {
      // Resume background music when showing a photo
      if (!audioPlaylist.isPlaying) {
        audioPlaylist.resume();
        console.log('🎵 Resumed background music for photo');
      }
    }
  }, [currentMedia, audioPlaylist]);

  // Prefetch next 10 media items in parallel
  useEffect(() => {
    const prefetchMedia = async () => {
      const itemsToPrefetch: number[] = [];
      
      // Get indices for next 10 items (wrapping around if needed)
      for (let i = 1; i <= 10; i++) {
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

      // Prefetch in parallel
      const prefetchPromises = itemsToPrefetch.map(async (index) => {
        const item = media[index];
        if (!item) return;

        try {
          if (item.isVideo && item.webContentLink) {
            // Prefetch video metadata only (faster, no timeout needed)
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = item.webContentLink;
            
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => {
                console.warn(`⚠️ Prefetch timeout for video index ${index}: ${item.name}`);
                resolve(); // Don't block on timeout
              }, 15000); // 15 second timeout for videos
              
              video.addEventListener('loadedmetadata', () => {
                clearTimeout(timeout);
                console.log(`✓ Prefetched video metadata index ${index}: ${item.name}`);
                resolve();
              }, { once: true });
              
              video.addEventListener('error', (e) => {
                clearTimeout(timeout);
                console.error(`✗ Failed to prefetch video index ${index}:`, e);
                resolve(); // Don't block on error
              }, { once: true });
            });
          } else if (item.isImage && item.webContentLink) {
            // Prefetch image
            const img = new Image();
            img.src = item.webContentLink;
            
            await new Promise<void>((resolve) => {
              const timeout = setTimeout(() => {
                console.warn(`⚠️ Prefetch timeout for image index ${index}: ${item.name}`);
                resolve();
              }, 10000); // 10 second timeout for images
              
              img.onload = () => {
                clearTimeout(timeout);
                console.log(`✓ Prefetched image index ${index}: ${item.name}`);
                resolve();
              };
              
              img.onerror = () => {
                clearTimeout(timeout);
                console.error(`✗ Failed to prefetch image index ${index}`);
                resolve();
              };
            });
          }
        } catch (error) {
          console.error(`Failed to prefetch item at index ${index}:`, error);
        }
      });

      await Promise.all(prefetchPromises);
    };

    prefetchMedia();
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

    const handleError = (e: Event) => {
      console.error('✗ Video error:', e);
      setHasError(true);
      setIsBuffering(false);
      toast({
        title: "Video Error",
        description: "Failed to load video. Please try the next one.",
        variant: "destructive",
      });
    };

    const handleStalled = () => {
      console.warn('⚠️ Video stalled');
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      console.log('▶️ Video playing');
      setIsBuffering(false);
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [currentMedia, toast]);

  // Auto screen rotation based on media aspect ratio
  useEffect(() => {
    const handleOrientationLock = async () => {
      if (!('orientation' in screen) || !screen.orientation) return;
      
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
      // Unlock orientation when component unmounts
      if ('orientation' in screen && screen.orientation) {
        screen.orientation.unlock();
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
    setMediaOpacity(0);
    
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % media.length;
        console.log(`➡️ Next: ${prev} → ${next} | ${media[next]?.name}`);
        return next;
      });
      setTimeout(() => {
        setMediaOpacity(1);
        isTransitioningRef.current = false;
      }, 30);
    }, 150);
  };

  const handlePrevious = () => {
    if (isTransitioningRef.current) return;
    
    isTransitioningRef.current = true;
    setMediaOpacity(0);
    
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = (prev - 1 + media.length) % media.length;
        console.log(`⬅️ Previous: ${prev} → ${next} | ${media[next]?.name}`);
        return next;
      });
      setTimeout(() => {
        setMediaOpacity(1);
        isTransitioningRef.current = false;
      }, 30);
    }, 150);
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
    if (isTransitioningRef.current) return;
    setTouchStart(e.targetTouches[0].clientY);
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTransitioningRef.current) return;
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentY);
  };

  const handleTouchEnd = () => {
    if (isTransitioningRef.current) return;
    
    const swipeDistance = touchStart - touchEnd;
    
    // Reduced threshold for faster, more responsive swipes (50px)
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

  const handleProgressDragStart = (e: React.MouseEvent | React.TouchEvent) => {
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
            ref={videoRef}
            src={currentMedia.webContentLink}
            className="w-full h-full object-contain transition-opacity duration-150 ease-in-out"
            style={{ opacity: mediaOpacity }}
            loop
            muted={isMuted}
            playsInline
            autoPlay
            preload="auto"
            crossOrigin="anonymous"
            onClick={handleTap}
            onDoubleClick={handleDoubleTap}
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
          ref={imageRef}
          src={currentMedia.webContentLink}
          alt={currentMedia.name}
          className="w-full h-full object-contain transition-opacity duration-150 ease-in-out"
          style={{ opacity: mediaOpacity }}
          onClick={handleTap}
          onDoubleClick={handleDoubleTap}
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
          <div
            id="video-progress-bar"
            className="relative h-1 bg-white/30 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
            data-testid="video-progress-bar"
          >
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
              style={{ width: `${videoProgress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${videoProgress}%`, transform: 'translate(-50%, -50%)' }}
              onMouseDown={handleProgressDragStart}
              onTouchStart={handleProgressDragStart}
              data-testid="video-progress-handle"
            />
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
