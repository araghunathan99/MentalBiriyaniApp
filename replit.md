# MentalBiriyani - A Curated Nostalgia Ride

## Overview

MentalBiriyani is an Instagram Reels-inspired mobile web application designed to display photos and videos from a local content folder in an immersive, swipeable feed. Its primary purpose is to provide a curated nostalgia experience. Key capabilities include a dark-first UI, gesture-driven interactions, full-screen Reels view, grid library view, media liking with local preference storage, and unique URL sharing for individual items. The project aims to deliver a PWA-enabled, static frontend application suitable for various static hosting environments, offering a rich media consumption experience without a backend.

## Recent Changes

### October 13, 2025 - Icons & Branding Update
- **Changed:** App icons and favicon now use biriyani.jpg image
- **Created:** PWA icons at multiple sizes (192x192, 512x512, 180x180 for Apple)
- **Created:** favicon.ico with proper multi-size support
- **Created:** Open Graph image (1200x630) for social media sharing
- **Updated:** manifest.json and index.html to reference new PNG icons

### October 13, 2025 - Global Audio System & UI Improvements
- **Major Fix:** Background music now properly resumes from saved position when swiping between videos and photos in Reels mode
- **Architecture:** Created global AudioContext to persist audio state across tab switches
- **Enhanced:** Grid view now shows 4 columns instead of 3 for more compact media display
- **Changed:** Videos in Reels mode now have audio enabled by default (previously muted)
- **Changed:** Chat password updated to "greyhound"
- **Fixed:** Playlist mode now works correctly - "Play Selected" properly plays selected songs
- **Behavior:** 
  - Reels audio automatically pauses when switching to Library tab
  - Reels audio automatically resumes when switching back from Library to Reels tab
  - Audio state persists across component mount/unmount cycles
- **Implementation:** 
  - Created `AudioContext` and `AudioProvider` for global audio state management
  - Refactored `play()` and `resume()` to set state first, then useEffect handles playback
  - Position restoration now happens before audio playback starts
  - Grid layout changed from `grid-cols-3` to `grid-cols-4` for denser tile display
  - Video `isMuted` state default changed from `true` to `false`
  - Chat access password changed from numeric code to "greyhound"
  - Added playback position tracking in `useAudioPlaylist` hook using `savedTimeRef`
  - Separated audio element initialization from event listeners in SongsView to prevent stale closures
  - Songs now search in both main list and playlist for proper playback
  - Fixed TypeScript errors for optional `webContentLink` fields

### October 13, 2025 - Video Conversion Enhancements
- **Enhanced:** Video conversion script now processes ALL video formats (not just .mov)
- **Added:** Automatic resolution reduction for files over 100MB
- **Supported formats:** .mov, .avi, .mkv, .webm, .flv, .wmv, .m4v, .mpeg, .mpg, .3gp, .ogv
- **Resolution tiers:** 720p → 540p → 480p → 360p → 240p (reduces until < 100MB)
- **Processing:** Converts existing MP4 files if they're over 100MB

### October 12, 2025 - LFS Download & Deployment Scripts
- **Issue:** Git LFS files not downloading in Replit (132-byte placeholders instead of actual content)
- **Solution:** Created curl-based download scripts with GitHub Personal Access Token authentication
- **Scripts added:**
  - `scripts/download-lfs-with-token.sh` - Automated LFS download using GitHub PAT
  - `scripts/download-lfs-via-curl.sh` - Alternative download methods
  - `scripts/check-lfs-status.sh` - Verify LFS file status
  - `scripts/deploy-github-pages.sh` - Git CLI-based deployment (avoids GitHub API rate limits)
- **Documentation:**
  - `QUICK_START_LFS.md` - 5-minute guide to download LFS files
  - `GIT_LFS_WORKAROUND.md` - Comprehensive LFS solutions
  - `DEPLOY_TO_GITHUB_PAGES.md` - Complete deployment guide
- **Build pipeline:** Fully configured for GitHub Pages deployment to `araghunathan99/MentalBiriyani` with base path `/MentalBiriyani/`

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The application features a dark-first UI, optimized for media consumption, with a mobile-first approach and gesture-based interactions (e.g., vertical swipe for Reels, reduced swipe threshold). Key UI patterns include a dynamic loading screen, full-screen Reels feed with randomized media and fast transitions, a grid view with filtering and liked media bubbling, a library viewer with gesture/keyboard controls, bottom navigation, and toast notifications. Controls are tap-to-toggle for a clean interface.

### Technical Implementations

- **Frontend:** React 18+ with TypeScript, Vite for bundling, Wouter for routing, TanStack Query for server state management. Shadcn UI components (New York style) built on Radix UI, styled with Tailwind CSS.
- **State Management:** Local state with React hooks, TanStack Query for caching server state, and LocalStorage for persisting user preferences (liked media).
- **Local Media System:** Media files are stored in `public/content/` and configured via `public/content/media-list.json`. The system supports common image and video formats, relying on static asset serving with no external API dependencies or authentication. Dynamic content loading automatically generates content lists (`media-list.json`, `audio-list.json`, `chat-list.json`) at build time from content folders.
- **Media Playback:** Muted autoplay for videos with tap-to-toggle play/pause, volume control, and a draggable progress bar on desktop. Videos use `playsInline`, `loop`, `preload="auto"`, `crossOrigin="anonymous"`. Background audio playlist for photo viewing with intelligent pause/resume and automatic track advancement.
- **Library Features:** The Library view includes "Songs" and "Chat" tabs. The "Songs" tab dynamically loads and allows playback of audio from `audio-list.json`, supporting multi-select for custom playlist creation. The "Chat" tab displays filtered Google Chat conversations parsed from an MBOX file, presented as collapsible cards with sender-specific styling.
- **Video Processing:** Automated build-time conversion of `.mov` files to MP4 using FFmpeg, including smart resolution handling, specific codecs, and web optimization. Old `.mov` files are deleted post-conversion, and `media-list.json` is updated.
- **PWA & Deployment:** The application is built as a Progressive Web App (PWA) with offline capabilities. Icons and favicon are generated from a source image. Automated GitHub Pages deployment script handles video conversion, Vite build, path fixing for GitHub Pages, cache-busting (timestamped assets, versioned service worker cache), media/PWA config copying, and git operations for deployment. Search engine protection is implemented via `robots.txt` and meta tags.
- **Caching:** LocalStorage-based caching for media with a 24-hour validity and version-based invalidation via `media-list.json` changes. HTTP cache-busting with timestamp query parameters and `no-store`/`no-cache` headers ensures fresh assets.

### System Design Choices

- **Fully Static Frontend:** No backend server or authentication, enabling deployment to any static hosting.
- **Mock Data Strategy:** Unsplash images as fallback mock media for development, decoupling frontend from real data.
- **LocalStorage for Persistence:** Liked media status is stored client-side, simplifying implementation but not syncing across devices.
- **Favorite Sorting:** Liked media automatically float to the top in the Library view, consistently applied across all filters.
- **Dynamic Content:** Content lists are generated from local files at build time, simplifying content updates.

## External Dependencies

- **Database:** Neon Serverless PostgreSQL (via `@neondatabase/serverless`) for potential future use, with Drizzle Kit for schema migrations (though not used for media content itself).
- **UI Libraries:** Shadcn UI, Radix UI, Tailwind CSS.
- **Routing:** Wouter.
- **State Management/Data Fetching:** TanStack Query (React Query).
- **Animations:** Canvas Confetti.
- **Form Handling:** React Hook Form with Zod resolvers.
- **Date Utilities:** Date-fns.
- **Video Conversion:** FFmpeg (system dependency).
- **Version Control:** Git LFS for large media files (361MB total: 163MB Chat.mbox, 110MB audio, 87MB video).

## Git LFS Configuration

- **Setup:** `.gitattributes` configured to track large files (videos, audio, .mbox, large JSON)
- **Tracked formats:** .mp4, .mov, .mp3, .wav, .mbox, chat-list.json
- **Total size:** ~361MB (within GitHub free tier limits)
- **Documentation:** See `GIT_LFS_SETUP.md` for complete setup instructions
- **Migration:** Use `git lfs migrate import` for existing files