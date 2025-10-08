import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReelsFeed from "@/components/ReelsFeed";
import GridView from "@/components/GridView";
import BottomNav from "@/components/BottomNav";
import type { MediaItem } from "@shared/schema";

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

  // TODO: Replace with actual Google Drive API call
  const { data: media = mockMedia, isLoading } = useQuery({
    queryKey: ["/api/media"],
    queryFn: async () => {
      // This will be replaced with actual API call
      return mockMedia;
    },
  });

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setActiveTab("reels");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
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
