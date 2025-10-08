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

// Initialize Google Drive client with OAuth2
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
    const accessToken = await getAccessToken();
    
    // Step 1: Search for the "MentalBiriyani" album using Google Photos Library API
    const albumsResponse = await fetch(
      'https://photoslibrary.googleapis.com/v1/albums',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!albumsResponse.ok) {
      throw new Error(`Failed to fetch albums: ${albumsResponse.statusText}`);
    }

    const albumsData = await albumsResponse.json();
    const albums = albumsData.albums || [];
    
    // Find the MentalBiriyani album (case-insensitive)
    const targetAlbum = albums.find((album: any) => 
      album.title?.toLowerCase() === 'mentalbiriyani'
    );

    if (!targetAlbum || !targetAlbum.id) {
      console.log('Available albums:', albums.map((a: any) => a.title).join(', '));
      throw new Error('Album "MentalBiriyani" not found in Google Photos');
    }

    console.log(`Found album "MentalBiriyani" with ID: ${targetAlbum.id}`);

    // Step 2: Fetch media items from the MentalBiriyani album
    const mediaResponse = await fetch(
      'https://photoslibrary.googleapis.com/v1/mediaItems:search',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          albumId: targetAlbum.id,
          pageSize: 100
        })
      }
    );

    if (!mediaResponse.ok) {
      throw new Error(`Failed to fetch media from album: ${mediaResponse.statusText}`);
    }

    const mediaData = await mediaResponse.json();
    const mediaItems = mediaData.mediaItems || [];

    if (mediaItems.length === 0) {
      throw new Error('No media items found in "MentalBiriyani" album');
    }

    console.log(`Found ${mediaItems.length} media items in "MentalBiriyani" album`);
    
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
    console.error('Error fetching media from MentalBiriyani album:', error);
    throw error;
  }
}

export async function getFileById(fileId: string) {
  try {
    const accessToken = await getAccessToken();
    
    // Fetch specific media item using Google Photos Library API
    const response = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems/${fileId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch media item: ${response.statusText}`);
    }

    const item = await response.json();
    
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
