# MentalBiriyani - A Curated Nostalgia Ride

## Overview

MentalBiriyani is an Instagram Reels-inspired mobile web application designed to display photos and videos from a local content folder in an immersive, swipeable feed. Its primary purpose is to provide a curated nostalgia experience. Key capabilities include a dark-first UI, gesture-driven interactions, full-screen Reels view, grid library view, media liking with local preference storage, and unique URL sharing for individual items. The project aims to deliver a PWA-enabled, static frontend application suitable for various static hosting environments, offering a rich media consumption experience without a backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 15, 2025 - Dynamic Content & Cache-Busting
- **JSON Manifest Cache Prevention:**
  - Added cache-busting to all content JSON manifests for dynamic updates
  - audio-list.json: Now uses ?t=${timestamp} with no-store headers (useAudioPlaylist.ts, SongsView.tsx)
  - chat-list.json: Added no-store headers to existing cache-busting (ChatView.tsx)
  - media-list.json: Already had proper cache-busting (maintained)
  - App now always fetches fresh content manifests, enabling dynamic content updates
  - Users can update content files without app rebuild/redeployment

### October 15, 2025 - Library Performance & Animation Fixes
- **Library View Performance Optimization:**
  - Fixed app freezing when switching to library view on iPhone 12 and other devices
  - Root cause: useCachedMedia hook was attempting to fetch and cache all 364 media items simultaneously
  - Solution: GridView now uses thumbnail URLs directly without caching
  - Lazy loading with native browser support prevents overwhelming the device
  - 404 errors and freezing completely eliminated
- **Library Viewer Animations:**
  - Added smooth slide up/down animations when swiping through media in library viewer
  - Animations now work properly on iOS Safari
  - Direction-aware transitions (slide up for next, slide down for previous)
  - 200ms duration with Instagram-like easing (cubic-bezier) for snappy, smooth feel

### October 15, 2025 - iPhone UI Fixes & Safe Area Support
- **iOS Debug Messages Removed:**
  - Removed all debug toast notifications that were showing iOS detection and media loading status
  - Cleaner user experience without diagnostic messages appearing on screen
- **Dynamic Island & Top Bar Fix:**
  - Added Tailwind CSS safe area utilities (pt-safe, pb-safe, pl-safe, pr-safe) using env(safe-area-inset-*)
  - Applied pt-safe to all sticky top elements: Home header, GridView filters, SongsView toolbar, ShareView header
  - Tabs and buttons at top now properly accessible on iPhone 14 and newer with Dynamic Island
  - Safe area padding gracefully degrades on devices without notch/island
- **Video Thumbnails in Library:**
  - Fixed video thumbnails not loading in library grid view
  - Changed from `<video preload="metadata">` to `<img>` with thumbnailLink for instant thumbnail display
  - All video tiles now show proper thumbnail previews with Play icon overlay
- **TypeScript Fixes:**
  - Fixed screen.orientation API type errors by using proper type guards and `as any` assertions
  - iOS Safari properly detected and skips orientation lock/unlock (not supported on iOS)

### October 14, 2025 - Pull-to-Refresh Navigation Fix
- **Pull-to-Refresh Behavior:**
  - Fixed issue where pulling down to refresh would navigate to /Home instead of staying on current page
  - Root cause: Hard refresh cleared sessionStorage flag, triggering landing page redirect
  - Solution: Switched from sessionStorage to localStorage for "visited" flag persistence
  - Visited flag now persists across page refreshes, preventing unwanted redirects
  - Users can now refresh the app without being sent back to landing page
  - Landing page only shows on first visit, as intended

### October 14, 2025 - iOS Safari Black Screen Fix & Audio Playback Fixes
- **iOS IndexedDB Blob Corruption Fix:**
  - Fixed critical iOS/iPadOS bug causing black screens in reels and library views
  - Root cause: Known WebKit bug where IndexedDB returns zero-byte blobs for large media files
  - All iOS browsers affected (Safari, Chrome, Firefox, Edge) as they all use WebKit on iOS
  - Solution: Disabled IndexedDB caching on all iOS/iPadOS browsers, stream media directly from URLs
  - Enhanced detection to properly identify both iPhone and iPadOS devices (desktop UA mode)
  - Added blob size verification to catch corruption on all platforms
  - Media now loads and swipes correctly on iPhone 14 and iPadOS devices in any browser
- **iOS Screen Orientation API Fix:**
  - Fixed runtime error: `screen.orientation.unlock is not a function` on iOS Safari
  - iOS Safari doesn't support the Screen Orientation API
  - Added proper feature detection before using orientation lock/unlock methods
  - Applied fix to both ReelsFeed and LibraryMediaViewer components
  - App now gracefully skips orientation control on iOS without errors
- **Background Audio Auto-Advance:**
  - Fixed closure issue in background audio (reels view) where track wouldn't auto-advance
  - Event listener now properly re-binds when playlist changes
  - Tracks now seamlessly advance to next song when current one ends
- **Songs Tab Playback:**
  - Fixed individual song playback in Songs tab with better error logging
  - Fixed playlist mode auto-advance for both single and multi-song playlists
  - Single-song playlists now loop correctly without pausing
  - Added comprehensive audio error handling and debugging logs
  - Improved state management to prevent toggle behavior during auto-advance

### October 13, 2025 - iOS Black Screen Fix & Library Viewer Caching
- **Library Viewer Fixes:**
  - Fixed black screen in Library view by implementing IndexedDB caching
  - LibraryMediaViewer now uses `fetchAndCacheMedia()` matching ReelsFeed's approach
  - Added loading states ("Loading media...") to prevent blank screens
  - Implemented iOS blob URL fallback for both images and videos
  - Added error states with helpful messages when media fails to load
  - Proper blob URL memory management with cleanup on unmount
- **iOS Session Storage Handling:**
  - Fixed black screen issue on iOS Safari after landing page navigation
  - Added iOS Safari Private Mode fallback using global window flag (`__fromLanding`)
  - Enhanced session storage error handling with comprehensive try-catch blocks
  - Improved logging for debugging iOS navigation issues
  - Graceful fallback when sessionStorage is unavailable (Private Mode)

### October 13, 2025 - Chat Chronological Ordering & Date Extraction
- **Chat Conversations Ordering:**
  - Conversations now display chronologically (oldest → newest, previously newest → oldest)
  - Intelligent date extraction from MBOX file using multiple methods:
    - Message timestamps from HTML content
    - Email `Date` headers from MBOX format
    - Year extraction from message text
  - Fallback numbering system for conversations without dates ("Conversation 1", "Conversation 2", etc.)
  - Smart grouping: dated conversations first (chronological), then numbered ones
- **UI Updates:**
  - ChatView component updated to display both dated and numbered conversations
  - Time display only shown for conversations with actual dates
  - New TypeScript interfaces support `displayDate` and `conversationNumber` fields
- **LFS Download:**
  - Created new download script for Chat.mbox from GitHub LFS
  - Uses GitHub API for proper URL resolution
  - Documented workaround for Replit environment token limitations
- **Documentation:**
  - Comprehensive setup guide in CHAT_CHRONOLOGICAL_ORDERING.md
  - Instructions for local download and parsing
  - Troubleshooting guide for common issues

### October 13, 2025 - iOS Video Progress Bar & Navigation Optimization
- **Video Progress Bar Enhancements:**
  - Progress bar handle now always visible on mobile/iOS (previously hidden due to hover-only CSS)
  - Added larger touch area (py-3 padding) for easier mobile interaction
  - Implemented separate touch handler for immediate position updates on touch devices
  - Desktop: hover to show handle (existing behavior maintained)
  - Mobile: handle always visible for better affordance
- **Navigation Improvements:**
  - Swipe gestures now properly disabled when dragging video progress bar
  - Added `isDraggingProgress` check to prevent navigation conflicts
  - 50px swipe threshold maintained for responsive navigation
- **Library Viewer Audio:**
  - Videos now play with sound (unmuted) when opened from library grid
  - Reels view videos remain muted for iOS autoplay compatibility

## System Architecture

### UI/UX Decisions

The application features a dark-first UI, optimized for media consumption, with a mobile-first approach and gesture-based interactions (e.g., vertical swipe for Reels, reduced swipe threshold). Key UI patterns include a dynamic loading screen, full-screen Reels feed with randomized media and fast transitions, a grid view with filtering and liked media bubbling, a library viewer with gesture/keyboard controls, bottom navigation, and toast notifications. Controls are tap-to-toggle for a clean interface. The grid view displays 4 columns for a more compact media display.

### Technical Implementations

- **Frontend:** React 18+ with TypeScript, Vite for bundling, Wouter for routing, TanStack Query for server state management. Shadcn UI components (New York style) built on Radix UI, styled with Tailwind CSS.
- **State Management:** Local state with React hooks, TanStack Query for caching server state, and LocalStorage for persisting user preferences (liked media).
- **Local Media System:** Media files are stored in `public/content/` and configured via `public/content/media-list.json`. The system supports common image and video formats, relying on static asset serving with no external API dependencies or authentication. Dynamic content loading automatically generates content lists (`media-list.json`, `audio-list.json`, `chat-list.json`) at build time from content folders. Automatic fallback to Unsplash mock data occurs if local LFS files are unavailable.
- **Media Playback:** Muted autoplay for videos with tap-to-toggle play/pause, volume control, and a draggable progress bar on desktop. Videos use `playsInline`, `loop`, `preload="auto"`, `crossOrigin="anonymous"`. Videos in the library viewer play with sound. A global AudioContext manages background audio playback for photo viewing, with intelligent pause/resume and automatic track advancement, persisting state across tab switches. iOS compatibility includes specific autoplay and playback fixes, default muted videos, and performance optimizations like reduced prefetch and async decoding.
- **Library Features:** The Library view includes "Songs" and "Chat" tabs. The "Songs" tab dynamically loads and allows playback of audio from `audio-list.json`, supporting multi-select for custom playlist creation. The "Chat" tab displays filtered Google Chat conversations parsed from an MBOX file, presented as collapsible cards with sender-specific styling and improved timestamp extraction.
- **Video Processing:** Automated build-time conversion script uses FFmpeg to process all video formats, including resolution reduction for files over 100MB, specific codecs, and web optimization. Existing MP4 files over 100MB are also processed.
- **PWA & Deployment:** The application is built as a Progressive Web App (PWA) with offline capabilities. Icons and favicon are generated from a source image (biriyani.jpg). Automated GitHub Pages deployment script handles video conversion, Vite build, path fixing, cache-busting, media/PWA config copying, and git operations for deployment. Search engine protection is implemented via `robots.txt` and meta tags.
- **Caching:** IndexedDB-based caching for all media, with automatic prefetching of next items. Blob URLs are properly tracked and revoked to prevent memory leaks. LocalStorage-based caching is used for other media aspects, with a 24-hour validity and version-based invalidation. HTTP cache-busting uses timestamp query parameters and `no-store`/`no-cache` headers. Cache size is limited to 100MB for iOS compatibility, with proactive cleanup and quota error handling.
- **UX Enhancements:** Reels position is preserved when switching views. The browser back button works contextually, and a hard refresh redirects to the landing page, ensuring the birthday message is seen on app entry.
- **Build & Deployment:** Streamlined build scripts for GitHub Pages, including automated LFS download using GitHub PAT.

### System Design Choices

- **Fully Static Frontend:** No backend server or authentication, enabling deployment to any static hosting.
- **Mock Data Strategy:** Unsplash images as fallback mock media for development, decoupling frontend from real data.
- **LocalStorage for Persistence:** Liked media status is stored client-side, simplifying implementation but not syncing across devices.
- **Favorite Sorting:** Liked media automatically float to the top in the Library view, consistently applied across all filters.
- **Dynamic Content:** Content lists are generated from local files at build time, simplifying content updates.

## External Dependencies

- **Database:** Neon Serverless PostgreSQL (via `@neondatabase/serverless`) for potential future use (not currently used for media content).
- **UI Libraries:** Shadcn UI, Radix UI, Tailwind CSS.
- **Routing:** Wouter.
- **State Management/Data Fetching:** TanStack Query (React Query).
- **Animations:** Canvas Confetti.
- **Form Handling:** React Hook Form with Zod resolvers.
- **Date Utilities:** Date-fns.
- **Video Conversion:** FFmpeg (system dependency).
- **Version Control:** Git LFS for large media files (e.g., .mp4, .mov, .mp3, .wav, .mbox, chat-list.json).