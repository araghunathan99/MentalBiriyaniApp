# Content Folder

Place your media files in this folder:

## Supported File Types

- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **Videos**: .mp4, .webm, .mov

## How to Add Media

1. Copy your photos and videos to this folder
2. Update `media-list.json` with the file information:
   ```json
   {
     "id": "unique-id",
     "name": "Display Name",
     "filename": "yourfile.jpg",
     "type": "image",
     "mimeType": "image/jpeg"
   }
   ```

## Example Structure

```
public/content/
├── media-list.json     # List of all media files
├── photo1.jpg          # Your photos
├── photo2.jpg
├── video1.mp4          # Your videos
└── video2.mp4
```

The app will automatically load and display all media listed in `media-list.json`.
