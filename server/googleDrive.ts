import { google } from 'googleapis';

// Initialize Google Drive API with OAuth2 client
export async function getGoogleDriveClient() {
  // For Replit connector integration, we'll use environment-based auth
  // The Replit connector should provide authentication automatically
  
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient as any });
  
  return drive;
}

export async function listMediaFiles() {
  try {
    const drive = await getGoogleDriveClient();
    
    // Search for image and video files
    const imageTypes = 'mimeType contains "image/" or mimeType contains "video/"';
    
    const response = await drive.files.list({
      q: imageTypes,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size)',
      pageSize: 100,
      orderBy: 'modifiedTime desc',
    });

    const files = response.data.files || [];
    
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
    console.error('Error fetching Google Drive files:', error);
    throw error;
  }
}

export async function getFileById(fileId: string) {
  try {
    const drive = await getGoogleDriveClient();
    
    const response = await drive.files.get({
      fileId,
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
    console.error(`Error fetching file ${fileId}:`, error);
    throw error;
  }
}
