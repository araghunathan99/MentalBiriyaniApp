# Google Drive Frontend Setup

To make Drive Reels a fully static app that runs in the browser without a backend, you need to set up Google OAuth credentials.

## Steps to Get Google OAuth Client ID:

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click "Select a project" → "New Project"
- Name it "Drive Reels" or similar
- Click "Create"

### 3. Enable Google Drive API
- Go to "APIs & Services" → "Library"
- Search for "Google Drive API"
- Click on it and click "Enable"

### 4. Create OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Choose "External" user type
- Fill in:
  - App name: "Drive Reels"
  - User support email: your email
  - Developer contact: your email
- Click "Save and Continue"
- Skip Scopes (click "Save and Continue")
- Add test users if needed
- Click "Save and Continue"

### 5. Create OAuth Client ID
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Choose "Web application"
- Name: "Drive Reels Web Client"
- Add Authorized JavaScript origins:
  - `http://localhost:5000` (for local testing)
  - Your production domain (e.g., `https://yourdomain.com`)
- Leave Authorized redirect URIs empty (not needed for implicit flow)
- Click "Create"

### 6. Copy Client ID
- Copy the "Client ID" (looks like: `xxxxx.apps.googleusercontent.com`)
- Save it - you'll need this!

## Configure the App:

### Option 1: Environment Variable (Recommended)
Create a `.env` file in the project root:
```
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### Option 2: Direct Configuration
Edit `client/src/lib/googleDrive.ts` and replace:
```typescript
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
```
with:
```typescript
const CLIENT_ID = 'your-client-id-here.apps.googleusercontent.com';
```

## How It Works:

1. User opens the app
2. App prompts for Google sign-in
3. User authorizes access to their Google Drive
4. App fetches photos/videos from their "MentalBiriyani" folder
5. Everything runs in the browser - no backend needed!

## Security Note:

The Client ID is safe to expose in frontend code. It only allows users to authenticate with their own Google accounts. Your Drive data remains private and secure.
