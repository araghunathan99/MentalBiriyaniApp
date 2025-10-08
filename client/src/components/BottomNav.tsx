import { Play, Grid3x3 } from "lucide-react";

interface BottomNavProps {
  activeTab: "reels" | "grid";
  onTabChange: (tab: "reels" | "grid") => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border pb-safe">
      <div className="flex items-center justify-around h-14">
        <button
          onClick={() => onTabChange("reels")}
          className="flex flex-col items-center justify-center gap-1 px-6 py-2 hover-elevate active-elevate-2 rounded-md transition-colors"
          data-testid="button-tab-reels"
        >
          <Play className={`h-6 w-6 ${activeTab === "reels" ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs font-semibold ${activeTab === "reels" ? "text-primary" : "text-muted-foreground"}`}>
            Reels
          </span>
          {activeTab === "reels" && (
            <div className="absolute bottom-0 h-0.5 w-12 bg-primary rounded-full" />
          )}
        </button>
        
        <button
          onClick={() => onTabChange("grid")}
          className="flex flex-col items-center justify-center gap-1 px-6 py-2 hover-elevate active-elevate-2 rounded-md transition-colors"
          data-testid="button-tab-grid"
        >
          <Grid3x3 className={`h-6 w-6 ${activeTab === "grid" ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-xs font-semibold ${activeTab === "grid" ? "text-primary" : "text-muted-foreground"}`}>
            Library
          </span>
          {activeTab === "grid" && (
            <div className="absolute bottom-0 h-0.5 w-12 bg-primary rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
}
