import type { MediaItem } from "@shared/schema";

// Google API Configuration
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// You'll need to set this to your Google OAuth Client ID
// Get it from: https://console.cloud.google.com/apis/credentials
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export async function initGoogleDrive(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Initialize gapi
    if (window.gapi) {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
          });
          gapiInited = true;
          maybeEnableButtons();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }

    // Initialize Google Identity Services
    if (window.google) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Will be set later
      });
      gisInited = true;
      maybeEnableButtons();
      resolve();
    }
  });
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    console.log('Google Drive API initialized');
  }
}

export async function authenticateGoogleDrive(): Promise<void> {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve();
    };

    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Skip display of account chooser and consent dialog
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

export async function searchMentalBiriyaniFolder(): Promise<string | null> {
  try {
    const response = await window.gapi.client.drive.files.list({
      q: "name='MentalBiriyani' and mimeType='application/vnd.google-apps.folder'",
      fields: 'files(id, name)',
      pageSize: 1,
    });

    const files = response.result.files;
    if (!files || files.length === 0) {
      console.log('MentalBiriyani folder not found');
      return null;
    }

    return files[0].id;
  } catch (error) {
    console.error('Error searching for folder:', error);
    return null;
  }
}

export async function fetchAllMediaFromFolder(folderId: string): Promise<MediaItem[]> {
  const allFiles: any[] = [];
  let pageToken: string | null = null;

  try {
    do {
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/')`,
        fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink, modifiedTime, size)',
        orderBy: 'modifiedTime desc',
        pageSize: 1000,
        pageToken: pageToken || undefined,
      });

      const files = response.result.files || [];
      allFiles.push(...files);
      pageToken = response.result.nextPageToken || null;
    } while (pageToken);

    return allFiles.map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      thumbnailLink: file.thumbnailLink || '',
      webContentLink: file.webContentLink || '',
      webViewLink: file.webViewLink || '',
      modifiedTime: file.modifiedTime,
      size: file.size || '0',
      isVideo: file.mimeType?.startsWith('video/') || false,
      isImage: file.mimeType?.startsWith('image/') || false,
    }));
  } catch (error) {
    console.error('Error fetching media from folder:', error);
    return [];
  }
}

export function getDirectImageUrl(fileId: string): string {
  // Use Google Drive's direct download URL with the current access token
  const token = window.gapi.client.getToken();
  if (token && token.access_token) {
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${token.access_token}`;
  }
  return '';
}

export function isAuthenticated(): boolean {
  return window.gapi && window.gapi.client.getToken() !== null;
}

export function signOut(): void {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken(null);
  }
}
