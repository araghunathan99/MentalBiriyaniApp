import type { LikedMedia } from "@shared/schema";

const LIKED_MEDIA_KEY = "drive-reels-liked-media";

export function getLikedMedia(): LikedMedia[] {
  try {
    const stored = localStorage.getItem(LIKED_MEDIA_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function isMediaLiked(mediaId: string): boolean {
  const liked = getLikedMedia();
  return liked.some((item) => item.id === mediaId);
}

export function toggleMediaLike(mediaId: string): boolean {
  const liked = getLikedMedia();
  const index = liked.findIndex((item) => item.id === mediaId);
  
  if (index > -1) {
    liked.splice(index, 1);
    localStorage.setItem(LIKED_MEDIA_KEY, JSON.stringify(liked));
    return false;
  } else {
    liked.push({ id: mediaId, likedAt: new Date().toISOString() });
    localStorage.setItem(LIKED_MEDIA_KEY, JSON.stringify(liked));
    return true;
  }
}
