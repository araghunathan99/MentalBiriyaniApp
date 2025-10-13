import { useState } from "react";
import { Play, Heart, Lock } from "lucide-react";
import { isMediaLiked } from "@/lib/localStorage";
import type { MediaItem } from "@shared/schema";
import SongsView from "./SongsView";
import ChatView from "./ChatView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GridViewProps {
  media: MediaItem[];
  onMediaClick: (index: number) => void;
}

const CHAT_PASSWORD = "greyhound";

export default function GridView({ media, onMediaClick }: GridViewProps) {
  const [filter, setFilter] = useState<"all" | "photos" | "videos" | "songs" | "chat">("all");
  const [isChatUnlocked, setIsChatUnlocked] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
          <button
            onClick={() => setFilter("songs")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === "songs"
                ? "bg-card text-foreground"
                : "bg-transparent text-muted-foreground hover-elevate"
            }`}
            data-testid="button-filter-songs"
          >
            Songs
          </button>
          <button
            onClick={() => {
              if (isChatUnlocked) {
                setFilter("chat");
              } else {
                setShowPasswordDialog(true);
                setPasswordError("");
                setPasswordInput("");
              }
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filter === "chat"
                ? "bg-card text-foreground"
                : "bg-transparent text-muted-foreground hover-elevate"
            }`}
            data-testid="button-filter-chat"
          >
            {!isChatUnlocked && <Lock className="w-3.5 h-3.5" />}
            Chat
          </button>
        </div>
      </div>

      {filter === "songs" ? (
        <SongsView />
      ) : filter === "chat" && isChatUnlocked ? (
        <ChatView />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-1 p-1">
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
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Chat Access
            </DialogTitle>
            <DialogDescription>
              Enter the password to access chat conversations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (passwordInput === CHAT_PASSWORD) {
                    setIsChatUnlocked(true);
                    setFilter("chat");
                    setShowPasswordDialog(false);
                    setPasswordInput("");
                  } else {
                    setPasswordError("Incorrect password");
                  }
                }
              }}
              className={passwordError ? "border-destructive" : ""}
              autoFocus
            />
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordInput("");
                setPasswordError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (passwordInput === CHAT_PASSWORD) {
                  setIsChatUnlocked(true);
                  setFilter("chat");
                  setShowPasswordDialog(false);
                  setPasswordInput("");
                } else {
                  setPasswordError("Incorrect password");
                }
              }}
            >
              Unlock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
