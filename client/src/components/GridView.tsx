import { useState } from "react";
import { Play, Heart } from "lucide-react";
import { isMediaLiked } from "@/lib/localStorage";
import type { MediaItem } from "@shared/schema";

interface GridViewProps {
  media: MediaItem[];
  onMediaClick: (index: number) => void;
}

export default function GridView({ media, onMediaClick }: GridViewProps) {
  const [filter, setFilter] = useState<"all" | "photos" | "videos">("all");

  // Note: media is already sorted by favorites from Home.tsx
  const filteredMedia = media.filter((item) => {
    if (filter === "photos") return item.isImage;
    if (filter === "videos") return item.isVideo;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "all"
                ? "bg-card text-foreground"
                : "bg-transparent text-muted-foreground hover-elevate"
            }`}
            data-testid="button-filter-all"
          >
            All
          </button>
          <button
            onClick={() => setFilter("photos")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "photos"
                ? "bg-card text-foreground"
                : "bg-transparent text-muted-foreground hover-elevate"
            }`}
            data-testid="button-filter-photos"
          >
            Photos
          </button>
          <button
            onClick={() => setFilter("videos")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "videos"
                ? "bg-card text-foreground"
                : "bg-transparent text-muted-foreground hover-elevate"
            }`}
            data-testid="button-filter-videos"
          >
            Videos
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-1 p-1">
          {filteredMedia.map((item, idx) => {
            const originalIndex = media.findIndex((m) => m.id === item.id);
            const liked = isMediaLiked(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => onMediaClick(originalIndex)}
                className="relative aspect-square overflow-hidden bg-card hover-elevate active-elevate-2 rounded-sm"
                data-testid={`button-media-${item.id}`}
              >
                {item.isVideo ? (
                  <video
                    src={item.webContentLink || ""}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={item.thumbnailLink || item.webContentLink || ""}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                
                {item.isVideo && (
                  <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
                    <Play className="h-3 w-3 text-white fill-white" />
                  </div>
                )}
                
                {liked && (
                  <div className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
                    <Heart className="h-3 w-3 text-destructive fill-destructive" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
