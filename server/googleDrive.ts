import { google } from 'googleapis';

// Initialize Google Photos API with OAuth2 client
export async function getGooglePhotosClient() {
  // For Replit connector integration, we'll use environment-based auth
  // The Replit connector should provide authentication automatically
  
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/photoslibrary.readonly'],
  });

  const authClient = await auth.getClient();
  const photos = (google as any).photoslibrary({ version: 'v1', auth: authClient });
  
  return photos;
}

// Legacy function name for backward compatibility
export async function getGoogleDriveClient() {
  return getGooglePhotosClient();
}

export async function listMediaFiles() {
  try {
    const photos = await getGooglePhotosClient();
    
    // First, search for the album named "MentalBiriyani"
    const albumsResponse = await photos.albums.list({
      pageSize: 50,
    });

    const albums = albumsResponse.data.albums || [];
    const targetAlbum = albums.find((album: any) => 
      album.title?.toLowerCase() === 'mentalbiriyani'
    );

    if (!targetAlbum || !targetAlbum.id) {
      console.log('Album "MentalBiriyani" not found. Available albums:', 
        albums.map((a: any) => a.title).join(', '));
      throw new Error('Album "MentalBiriyani" not found in Google Photos');
    }

    console.log(`Found album "MentalBiriyani" with ID: ${targetAlbum.id}`);

    // Fetch media items from the album
    const mediaResponse = await photos.mediaItems.search({
      requestBody: {
        albumId: targetAlbum.id,
        pageSize: 100,
      },
    });

    const mediaItems = mediaResponse.data.mediaItems || [];
    
    return mediaItems.map((item: any) => ({
      id: item.id || '',
      name: item.filename || '',
      mimeType: item.mimeType || '',
      thumbnailLink: item.baseUrl,
      webContentLink: item.baseUrl,
      webViewLink: item.productUrl,
      modifiedTime: item.mediaMetadata?.creationTime,
      size: undefined,
      isVideo: item.mimeType?.startsWith('video/') || false,
      isImage: item.mimeType?.startsWith('image/') || false,
    }));
  } catch (error) {
    console.error('Error fetching Google Photos files:', error);
    throw error;
  }
}

export async function getFileById(fileId: string) {
  try {
    const photos = await getGooglePhotosClient();
    
    const response = await photos.mediaItems.get({
      mediaItemId: fileId,
    });

    const item = response.data;
    
    return {
      id: item.id || '',
      name: item.filename || '',
      mimeType: item.mimeType || '',
      thumbnailLink: item.baseUrl,
      webContentLink: item.baseUrl,
      webViewLink: item.productUrl,
      modifiedTime: item.mediaMetadata?.creationTime,
      size: undefined,
      isVideo: item.mimeType?.startsWith('video/') || false,
      isImage: item.mimeType?.startsWith('image/') || false,
    };
  } catch (error) {
    console.error(`Error fetching media item ${fileId}:`, error);
    throw error;
  }
}
