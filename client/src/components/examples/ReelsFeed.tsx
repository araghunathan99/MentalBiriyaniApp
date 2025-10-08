import ReelsFeed from "../ReelsFeed";

const mockMedia = [
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
];

export default function ReelsFeedExample() {
  return (
    <div className="w-full h-screen">
      <ReelsFeed media={mockMedia} />
    </div>
  );
}
