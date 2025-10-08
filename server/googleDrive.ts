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
    const drive = await getGoogleDriveClient();
    
    // Search for files in Google Photos space with name containing "MentalBiriyani"
    // Note: We're using Drive API with spaces='photos' to access Google Photos
    const response = await drive.files.list({
      spaces: 'photos',
      q: "name contains 'MentalBiriyani' or fullText contains 'MentalBiriyani'",
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size, description)',
      pageSize: 100,
      orderBy: 'modifiedTime desc',
    });

    let files = response.data.files || [];
    
    // If no files found with album name in query, try getting all photos
    if (files.length === 0) {
      console.log('No files found with "MentalBiriyani" in name, fetching all photos from Google Photos');
      const allPhotosResponse = await drive.files.list({
        spaces: 'photos',
        q: 'mimeType contains "image/" or mimeType contains "video/"',
        fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size)',
        pageSize: 100,
        orderBy: 'modifiedTime desc',
      });
      files = allPhotosResponse.data.files || [];
    }

    console.log(`Found ${files.length} media items from Google Photos`);
    
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
  } catch (error) {
    console.error('Error fetching Google Photos files:', error);
    throw error;
  }
}

export async function getFileById(fileId: string) {
  try {
    const drive = await getGoogleDriveClient();
    
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size',
      supportsAllDrives: true,
    });

    const file = response.data;
    
    return {
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
    };
  } catch (error) {
    console.error(`Error fetching file ${fileId}:`, error);
    throw error;
  }
}
