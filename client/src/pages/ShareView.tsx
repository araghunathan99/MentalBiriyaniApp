import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Heart, Share2, Download } from "lucide-react";
import { MediaItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { isMediaLiked, toggleMediaLike } from "@/lib/localStorage";
import { useState } from "react";

export default function ShareView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(() => isMediaLiked(id || ""));

  const { data: media, isLoading, error } = useQuery<MediaItem>({
    queryKey: ["/api/media", id],
    enabled: !!id,
  });

  const handleToggleLike = () => {
    if (!id) return;
    const newLikedState = toggleMediaLike(id);
    setIsLiked(newLikedState);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: media?.name || "Shared Memory",
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          fallbackCopyToClipboard(shareUrl);
        }
      }
    } else {
      fallbackCopyToClipboard(shareUrl);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Media not found</h2>
        <p className="text-muted-foreground mb-4">
          This media item could not be loaded.
        </p>
        <button
          onClick={() => setLocation("/")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-elevate active-elevate-2"
          data-testid="button-go-home"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-foreground hover-elevate active-elevate-2 px-3 py-2 rounded-md"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold text-foreground truncate flex-1 px-4">
          {media.name}
        </h1>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {media.isImage && (
          <img
            src={media.webContentLink || media.webViewLink || ""}
            alt={media.name}
            className="max-w-full max-h-full object-contain rounded-lg"
            data-testid={`img-media-${media.id}`}
          />
        )}
        {media.isVideo && (
          <video
            src={media.webContentLink || media.webViewLink || ""}
            controls
            className="max-w-full max-h-full rounded-lg"
            data-testid={`video-media-${media.id}`}
          />
        )}
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border px-4 py-4 flex items-center justify-around">
        <button
          onClick={handleToggleLike}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-md hover-elevate active-elevate-2 transition-colors ${
            isLiked ? "text-red-500" : "text-muted-foreground"
          }`}
          data-testid="button-like"
        >
          <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
          <span className="text-xs">Like</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-md text-muted-foreground hover-elevate active-elevate-2"
          data-testid="button-share"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-xs">Share</span>
        </button>

        {media.webContentLink && (
          <a
            href={media.webContentLink}
            download={media.name}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-md text-muted-foreground hover-elevate active-elevate-2"
            data-testid="link-download"
          >
            <Download className="w-6 h-6" />
            <span className="text-xs">Download</span>
          </a>
        )}
      </div>
    </div>
  );
}
