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
    
    console.log('Attempting to fetch from Google Photos Library API...');
    
    // Try Google Photos Library API first (requires photoslibrary.readonly scope)
    try {
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
        const errorText = await albumsResponse.text();
        throw new Error(`Photos API failed: ${albumsResponse.status} ${albumsResponse.statusText}`);
      }

      const albumsData = await albumsResponse.json();
      const albums = albumsData.albums || [];
      
      console.log(`✓ Found ${albums.length} albums via Photos API. Looking for "MentalBiriyani"...`);
      
      const targetAlbum = albums.find((album: any) => 
        album.title?.toLowerCase() === 'mentalbiriyani'
      );

      if (!targetAlbum || !targetAlbum.id) {
        const albumTitles = albums.map((a: any) => a.title).join(', ');
        console.log('Available albums:', albumTitles || 'none');
        throw new Error(`Album "MentalBiriyani" not found. Available: ${albumTitles || 'none'}`);
      }

      console.log(`✓ Found album "MentalBiriyani" (ID: ${targetAlbum.id})`);

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
        throw new Error(`Failed to fetch media: ${mediaResponse.status} ${mediaResponse.statusText}`);
      }

      const mediaData = await mediaResponse.json();
      const mediaItems = mediaData.mediaItems || [];

      if (mediaItems.length === 0) {
        throw new Error('No media items in "MentalBiriyani" album');
      }

      console.log(`✓ Successfully fetched ${mediaItems.length} items via Photos API`);
      
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
    } catch (photosError) {
      console.log('Photos API failed, falling back to Drive API:', photosError);
      
      // Fallback to Google Drive API (works with drive.photos.readonly scope)
      const drive = await getGoogleDriveClient();
      
      console.log('Using Drive API fallback to search for "MentalBiriyani"...');
      
      const response = await drive.files.list({
        spaces: 'photos',
        q: "name contains 'MentalBiriyani'",
        fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size)',
        pageSize: 100,
        orderBy: 'modifiedTime desc',
      });

      const files = response.data.files || [];
      
      if (files.length === 0) {
        throw new Error('No files found with "MentalBiriyani" in name via Drive API fallback');
      }

      console.log(`✓ Found ${files.length} media items via Drive API fallback`);
      
      return files.map((file) => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        thumbnailLink: file.thumbnailLink,
        webContentLink: file.webContentLink,
        webViewLink: file.webViewLink,
        modifiedTime: file.modifiedTime,
        size: file.size,
        isVideo: file.mimeType?.startsWith('video/') || false,
        isImage: file.mimeType?.startsWith('image/') || false,
      }));
    }
  } catch (error) {
    console.error('All methods failed to fetch media:', error);
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
      const errorText = await response.text();
      throw new Error(`Failed to fetch media item: ${response.status} ${response.statusText} - ${errorText}`);
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
