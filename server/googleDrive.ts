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
      
      console.log('Searching for "MentalBiriyani" folder in Google Drive...');
      
      // Step 1: Search for a folder named "MentalBiriyani"
      const folderResponse = await drive.files.list({
        q: "name='MentalBiriyani' and mimeType='application/vnd.google-apps.folder'",
        fields: 'files(id, name)',
        pageSize: 10,
      });

      const folders = folderResponse.data.files || [];
      
      if (folders.length > 0) {
        const folderId = folders[0].id;
        console.log(`✓ Found folder "MentalBiriyani" (ID: ${folderId})`);
        
        // Step 2: List all media files in the folder
        const filesResponse = await drive.files.list({
          q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/')`,
          fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size)',
          pageSize: 100,
          orderBy: 'modifiedTime desc',
        });

        const files = filesResponse.data.files || [];
        
        if (files.length === 0) {
          throw new Error(`Folder "MentalBiriyani" is empty`);
        }

        console.log(`✓ Found ${files.length} media items in "MentalBiriyani" folder`);
        
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
      
      // If no folder found, try listing all accessible Drive files
      console.log('No folder found, listing all accessible files in Drive...');
      const allFilesResponse = await drive.files.list({
        q: "(mimeType contains 'image/' or mimeType contains 'video/')",
        fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size)',
        pageSize: 100,
        orderBy: 'modifiedTime desc',
      });

      const allFiles = allFilesResponse.data.files || [];
      
      if (allFiles.length === 0) {
        console.log('No media files accessible in Drive. Trying photos space without query...');
        
        // Last attempt - try photos space without any query filter
        const photosResponse = await drive.files.list({
          spaces: 'photos',
          fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size)',
          pageSize: 100,
        });
        
        const photoFiles = photosResponse.data.files || [];
        
        if (photoFiles.length === 0) {
          throw new Error('No media files found in Google Photos or Drive. Please check permissions or add photos to "MentalBiriyani" folder.');
        }
        
        console.log(`✓ Found ${photoFiles.length} items in Google Photos (all photos)`);
        
        return photoFiles.map((file) => ({
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

      console.log(`✓ Found ${allFiles.length} media items in Drive`);
      
      return allFiles.map((file) => ({
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
