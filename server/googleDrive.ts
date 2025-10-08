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
    
    console.log('Searching for "MentalBiriyani" folder in Google Drive...');
    
    // Step 1: Find the MentalBiriyani folder
    const folderResponse = await drive.files.list({
      q: "name='MentalBiriyani' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)',
      pageSize: 1,
    });

    const folders = folderResponse.data.files || [];
    
    if (folders.length === 0) {
      throw new Error('Folder "MentalBiriyani" not found in Google Drive. Please create this folder and add photos/videos to it.');
    }

    const folderId = folders[0].id!;
    console.log(`✓ Found folder "MentalBiriyani" (ID: ${folderId})`);
    
    // Step 2: Fetch ALL media files from the folder using pagination
    const allFiles: any[] = [];
    let nextPageToken: string | null | undefined = undefined;
    let pageCount = 0;
    
    do {
      pageCount++;
      const response = await drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`,
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size)',
        pageSize: 100,
        orderBy: 'modifiedTime desc',
        pageToken: nextPageToken || undefined,
      });

      const files = response.data.files || [];
      allFiles.push(...files);
      nextPageToken = response.data.nextPageToken;
      
      console.log(`  Page ${pageCount}: Found ${files.length} files (total so far: ${allFiles.length})`);
    } while (nextPageToken);
    
    if (allFiles.length === 0) {
      throw new Error('No photos or videos found in "MentalBiriyani" folder. Please add some media files to this folder.');
    }

    console.log(`✓ Found ${allFiles.length} total photos and videos in "MentalBiriyani" folder`);
    
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
  } catch (error) {
    console.error('Failed to fetch media from Google Drive:', error);
    throw error;
  }
}

export async function getFileById(fileId: string) {
  try {
    const drive = await getGoogleDriveClient();
    
    // Fetch specific file from Google Drive
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size',
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
    console.error(`Error fetching media item ${fileId}:`, error);
    throw error;
  }
}
