import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

// Initialize Google Photos API with OAuth2 client
export async function getGooglePhotosClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  const photos = (google as any).photoslibrary({ version: 'v1', auth: oauth2Client });
  
  return photos;
}

// Legacy function name for backward compatibility
export async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
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
