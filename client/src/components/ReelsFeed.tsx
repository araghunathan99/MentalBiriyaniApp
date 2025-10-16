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
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState<{ [key: number]: number }>({});
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isBuffering, setIsBuffering] = useState<{ [key: number]: boolean }>({});
  const [hasError, setHasError] = useState<{ [key: number]: boolean }>({});
  const [cachedMediaUrls, setCachedMediaUrls] = useState<{ [key: number]: string }>({});
  const cachedBlobRefs = useRef<{ [key: number]: string }>({});
  const hasTriedFallbackRefs = useRef<{ [key: number]: boolean }>({});
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const imageRefs = useRef<{ [key: number]: HTMLImageElement | null }>({});
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefetchedRef = useRef<Set<number>>(new Set());
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const audio = useAudio();

  const currentMedia = media[currentIndex];

  // Notify parent of index changes
  useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex, onIndexChange]);

  // Scroll to initial index on mount
  useEffect(() => {
    if (containerRef.current) {
      const scrollToIndex = initialIndex;
      containerRef.current.scrollTo({
        top: scrollToIndex * window.innerHeight,
        behavior: 'auto'
      });
    }
  }, []);

  // Handle scroll events to update current index and fade effects
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateActiveItem = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = window.innerHeight;
      
      // Update active class for fade effect
      const items = container.querySelectorAll('.reel-item');
      items.forEach((item, index) => {
        const itemTop = index * viewportHeight;
        const itemCenter = itemTop + viewportHeight / 2;
        const viewportCenter = scrollTop + viewportHeight / 2;
        const distance = Math.abs(itemCenter - viewportCenter);
        
        if (distance < viewportHeight / 2) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    };

    const handleScroll = () => {
      isScrollingRef.current = true;
      updateActiveItem();
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const newIndex = Math.round(scrollTop / window.innerHeight);
        
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < media.length) {
          setCurrentIndex(newIndex);
          console.log(`📜 Scrolled to index ${newIndex}: ${media[newIndex]?.name}`);
        }
        
        isScrollingRef.current = false;
      }, 150);
    };

    // Initial update
    updateActiveItem();

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentIndex, media.length]);

  // Load cached media URLs for all items
  useEffect(() => {
    media.forEach((item, index) => {
      if (!item?.webContentLink || cachedMediaUrls[index]) return;

      fetchAndCacheMedia(item.webContentLink)
        .then((url) => {
          setCachedMediaUrls(prev => ({ ...prev, [index]: url }));
          cachedBlobRefs.current[index] = url;
        })
        .catch((error) => {
          console.error(`❌ Error loading media at index ${index}:`, error);
          setCachedMediaUrls(prev => ({ ...prev, [index]: item.webContentLink || "" }));
        });
    });

    return () => {
      // Cleanup blob URLs on unmount
      Object.values(cachedBlobRefs.current).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [media]);

  // Start background music when component mounts
  useEffect(() => {
    if (!currentMedia?.isVideo) {
      console.log('🎵 Starting audio for photo on mount');
      audio.play();
    }
  }, []);

  // Manage background music based on media type
  useEffect(() => {
    if (!currentMedia) return;

    if (currentMedia.isVideo) {
      if (audio.isPlaying) {
        audio.pause();
        console.log('🎵 Paused background music for video');
      }
    } else if (currentMedia.isImage) {
      if (!audio.isPlaying) {
        audio.resume();
        console.log('🎵 Resumed background music for photo');
      }
    }
  }, [currentMedia?.id, currentMedia?.isVideo, currentMedia?.isImage]);

  // Prefetch next media items
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const prefetchCount = isIOS ? 3 : 10;

    const prefetchNextItems = async () => {
      const itemsToPrefetch: number[] = [];
      
      for (let i = 1; i <= prefetchCount; i++) {
        const nextIndex = (currentIndex + i) % media.length;
        if (!prefetchedRef.current.has(nextIndex)) {
          itemsToPrefetch.push(nextIndex);
        }
      }

      if (itemsToPrefetch.length > 0) {
        console.log(`🔄 Prefetching ${itemsToPrefetch.length} items from index ${currentIndex}:`, itemsToPrefetch);
      }

      itemsToPrefetch.forEach(index => prefetchedRef.current.add(index));

      const prefetchPromises = itemsToPrefetch.map(async (index) => {
        const item = media[index];
        if (!item) return;

        try {
          if (item.webContentLink) {
            await prefetchMedia(item.webContentLink);
            console.log(`✓ Prefetched ${item.isVideo ? 'video' : 'image'} index ${index}: ${item.name}`);
          }
          if (item.thumbnailLink && item.thumbnailLink !== item.webContentLink) {
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
    }
  }, [currentMedia]);

  // Auto-hide controls
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

  // Keyboard navigation
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

  // Mouse wheel navigation
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

  const handleNext = () => {
    if (isScrollingRef.current) return;
    
    const nextIndex = (currentIndex + 1) % media.length;
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: nextIndex * window.innerHeight,
        behavior: 'auto'
      });
    }
  };

  const handlePrevious = () => {
    if (isScrollingRef.current) return;
    
    const prevIndex = (currentIndex - 1 + media.length) % media.length;
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: prevIndex * window.innerHeight,
        behavior: 'auto'
      });
    }
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
      setShowControls(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = undefined;
      }
    } else {
      if (currentMedia?.isVideo) {
        const video = videoRefs.current[currentIndex];
        if (video) {
          if (video.paused) {
            video.play();
            setIsPlaying(true);
          } else {
            video.pause();
            setIsPlaying(false);
          }
        }
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    const video = videoRefs.current[index];
    if (!video) return;
    
    const duration = video.duration;
    if (!isFinite(duration) || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * duration;
    
    if (isFinite(newTime)) {
      video.currentTime = newTime;
      setVideoProgress(prev => ({ ...prev, [index]: percentage }));
    }
  };

  if (!currentMedia) return null;

  return (
    <div 
      ref={containerRef}
      className="reels-container bg-black"
    >
      {media.map((item, index) => {
        const cachedUrl = cachedMediaUrls[index];
        const isCurrentItem = index === currentIndex;
        
        return (
          <div 
            key={item.id} 
            className="reel-item relative w-full bg-black"
            onClick={handleTap}
            onDoubleClick={handleDoubleTap}
          >
            {item.isVideo ? (
              <>
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  src={cachedUrl || item.webContentLink}
                  className="max-w-full max-h-full object-contain"
                  loop
                  muted={isMuted}
                  playsInline
                  autoPlay={isCurrentItem}
                  preload="auto"
                  crossOrigin="anonymous"
                  data-testid={`video-player-${index}`}
                  onWaiting={() => setIsBuffering(prev => ({ ...prev, [index]: true }))}
                  onCanPlay={() => setIsBuffering(prev => ({ ...prev, [index]: false }))}
                  onError={() => {
                    if (!hasTriedFallbackRefs.current[index] && cachedUrl?.startsWith('blob:')) {
                      hasTriedFallbackRefs.current[index] = true;
                      setCachedMediaUrls(prev => ({ ...prev, [index]: item.webContentLink || "" }));
                    } else {
                      setHasError(prev => ({ ...prev, [index]: true }));
                    }
                  }}
                  onTimeUpdate={(e) => {
                    const video = e.currentTarget;
                    const progress = (video.currentTime / video.duration) * 100;
                    setVideoProgress(prev => ({ ...prev, [index]: progress || 0 }));
                  }}
                />
                {isBuffering[index] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                )}
                {hasError[index] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                    <div className="text-center text-white p-4">
                      <p className="text-lg font-semibold">Video Failed to Load</p>
                      <p className="text-sm opacity-70 mt-2">Scroll to next video</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img
                ref={(el) => { imageRefs.current[index] = el; }}
                src={cachedUrl || item.webContentLink}
                alt={item.name}
                className="max-w-full max-h-full object-contain"
                decoding="async"
                loading={index <= currentIndex + 2 ? "eager" : "lazy"}
                onError={() => {
                  if (cachedUrl?.startsWith('blob:')) {
                    setCachedMediaUrls(prev => ({ ...prev, [index]: item.webContentLink || "" }));
                  }
                }}
                data-testid={`image-viewer-${index}`}
              />
            )}

            {/* Controls overlay - only show for current item */}
            {isCurrentItem && (
              <>
                <div 
                  className={`absolute top-0 left-0 right-0 p-4 pt-safe bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium truncate" data-testid="text-media-name">{item.name}</p>
                      <p className="text-white/70 text-xs" data-testid="text-media-time">
                        {item.modifiedTime ? new Date(item.modifiedTime).toLocaleDateString() : ""}
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

                  {item.isVideo && (
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

                {item.isVideo && (
                  <div className={`absolute left-0 right-0 bottom-16 px-4 transition-opacity duration-200 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="py-3 -my-3">
                      <div
                        className="relative h-1 bg-white/30 rounded-full cursor-pointer group"
                        onClick={(e) => handleProgressClick(e, index)}
                        data-testid="video-progress-bar"
                      >
                        <div
                          className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
                          style={{ width: `${videoProgress[index] || 0}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          style={{ left: `${videoProgress[index] || 0}%`, transform: 'translate(-50%, -50%)' }}
                          data-testid="video-progress-handle"
                        />
                      </div>
                    </div>
                  </div>
                )}


                {!item.isVideo && !isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
