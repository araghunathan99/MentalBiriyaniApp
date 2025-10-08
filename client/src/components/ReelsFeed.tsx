import { useState, useEffect, useRef } from "react";
import { Heart, Share2, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleMediaLike, isMediaLiked } from "@/lib/localStorage";
import type { MediaItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ReelsFeedProps {
  media: MediaItem[];
  initialIndex?: number;
}

export default function ReelsFeed({ media, initialIndex = 0 }: ReelsFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const currentMedia = media[currentIndex];

  useEffect(() => {
    if (currentMedia) {
      setIsLiked(isMediaLiked(currentMedia.id));
    }
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
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
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
    if (currentMedia?.isVideo) {
      setIsPlaying(!isPlaying);
    }
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      handleNext();
    }
    if (touchStart - touchEnd < -75) {
      handlePrevious();
    }
  };

  if (!currentMedia) return null;

  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {currentMedia.isVideo ? (
        <video
          ref={videoRef}
          src={currentMedia.webContentLink || ""}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          autoPlay
          onClick={handleTap}
          onDoubleClick={handleDoubleTap}
          data-testid="video-player"
        />
      ) : (
        <img
          src={currentMedia.thumbnailLink || currentMedia.webContentLink || ""}
          alt={currentMedia.name}
          className="w-full h-full object-cover"
          onClick={handleTap}
          onDoubleClick={handleDoubleTap}
          data-testid="image-viewer"
        />
      )}

      <div 
        className={`absolute top-0 left-0 right-0 p-4 pt-safe bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
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

      <div className={`absolute right-4 bottom-24 flex flex-col gap-6 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <div className="flex flex-col items-center">
          <Button
            size="icon"
            variant="ghost"
            className="h-12 w-12 rounded-full bg-transparent text-white hover:scale-110 transition-transform no-default-hover-elevate"
            onClick={handleLike}
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
            onClick={handleShare}
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
              onClick={() => setIsMuted(!isMuted)}
              data-testid="button-mute"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          </div>
        )}
      </div>

      <div className={`absolute left-0 right-0 bottom-0 p-4 pb-safe bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1">
            {media.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-white w-6" : "bg-white/40 w-1"
                }`}
              />
            ))}
          </div>
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
