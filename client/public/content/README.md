# Local Media Content Folder

This folder contains your media files that will be displayed in the Drive Reels app.

## How to Add Your Media

1. **Add your media files** (images and videos) to this folder:
   - Supported image formats: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Supported video formats: `.mp4`, `.webm`

2. **Update `media-list.json`** to include your files:

```json
{
  "version": "1.0.0",
  "lastModified": "2025-10-09T12:00:00.000Z",
  "items": [
    {
      "id": "unique-id-1",
      "name": "My Photo.jpg",
      "mimeType": "image/jpeg",
      "file": "my-photo.jpg",
      "createdTime": "2025-01-01T00:00:00.000Z",
      "modifiedTime": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "unique-id-2",
      "name": "My Video.mp4",
      "mimeType": "video/mp4",
      "file": "my-video.mp4",
      "createdTime": "2025-01-02T00:00:00.000Z",
      "modifiedTime": "2025-01-02T00:00:00.000Z"
    }
  ]
}
```

## Media List JSON Structure

**Top Level:**
- **version**: Version number (increment when content changes to clear browser cache)
- **lastModified**: ISO 8601 timestamp of last update
- **items**: Array of media items

**Each Media Item:**
- **id**: A unique identifier for each media item (can be any string)
- **name**: Display name for the media
- **mimeType**: MIME type (e.g., "image/jpeg", "video/mp4")
- **file**: The actual filename in this folder
- **createdTime**: ISO 8601 timestamp (used for sorting)
- **modifiedTime**: ISO 8601 timestamp (used for sorting)

## Example

If you have a photo named `beach-sunset.jpg`, add it to this folder and update `media-list.json`:

```json
{
  "version": "1.0.1",
  "lastModified": "2025-10-09T12:00:00.000Z",
  "items": [
    {
      "id": "beach-1",
      "name": "Beach Sunset",
      "mimeType": "image/jpeg",
      "file": "beach-sunset.jpg",
      "createdTime": "2025-10-09T12:00:00.000Z",
      "modifiedTime": "2025-10-09T12:00:00.000Z"
    }
  ]
}
```

**Important:** Increment the `version` number whenever you update the media list to ensure browser caches are refreshed.

## Folder Structure

```
client/public/content/
├── media-list.json     # Configuration file listing all media
├── README.md           # This file
├── your-photo.jpg      # Your image files
└── your-video.mp4      # Your video files
```

## Notes

- Media items are sorted by modification time (newest first)
- The app supports both photos and videos
- Keep filenames simple (lowercase, no spaces, use hyphens)
- The app will automatically display your media in the Reels feed and grid library
