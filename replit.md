# MentalBiriyani - A Curated Nostalgia Ride

## Overview
MentalBiriyani is an Instagram Reels-inspired mobile web application designed to display photos and videos from a local content folder in an immersive, swipeable feed. Its primary purpose is to provide a curated nostalgia experience with a dark-first UI, gesture-driven interactions, full-screen Reels view, grid library view, media liking with local preference storage, and unique URL sharing for individual items. The project aims to deliver a PWA-enabled, static frontend application suitable for various static hosting environments, offering a rich media consumption experience without a backend. It includes a business vision to offer a personal, curated media experience, recognizing market potential in digital scrapbooking and personal archives, with an ambition to evolve into a customizable digital memory capsule.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The application features a dark-first UI, optimized for media consumption, with a mobile-first approach and gesture-based interactions (e.g., vertical swipe for Reels, reduced swipe threshold). Key UI patterns include a dynamic loading screen, full-screen Reels feed with randomized media and fast slide transitions (200ms Instagram-like animations), a grid view with filtering and liked media bubbling, a library viewer with gesture/keyboard controls, bottom navigation, and toast notifications. Controls are tap-to-toggle for a clean interface. The grid view displays 4 columns for a more compact media display. Both Reels and Library views use vertical slide animations for media transitions: swipe down reveals content sliding up (next item), swipe up reveals content sliding down (previous item). iOS-optimized animations use translate3d transforms with hardware acceleration (will-change, backface-visibility) for smooth performance on all devices.

### Technical Implementations
- **Frontend:** React 18+ with TypeScript, Vite for bundling, Wouter for routing, TanStack Query for server state management. Shadcn UI components (New York style) built on Radix UI, styled with Tailwind CSS.
- **State Management:** Local state with React hooks, TanStack Query for caching server state, and LocalStorage for persisting user preferences (liked media).
- **Local Media System:** Media files are stored in `public/content/` and configured via `public/content/media-list.json`. The system supports common image and video formats, relying on static asset serving with no external API dependencies or authentication. Dynamic content loading automatically generates content lists (`media-list.json`, `audio-list.json`, `chat-list.json`) at build time from content folders. Automated thumbnail generation using FFmpeg (videos) and Sharp (images) occurs at build-time, creating 400x400 optimized thumbnails in `content/thumbnails/` directory. GridView loads thumbnails for efficient performance; full media loads on-demand in library viewer. Graceful fallback: items without thumbnails use full media. Automatic fallback to Unsplash mock data occurs if local LFS files are unavailable.
- **Media Playback:** Muted autoplay for videos with tap-to-toggle play/pause, volume control, and a draggable progress bar on desktop. Videos use `playsInline`, `loop`, `preload="auto"`, `crossOrigin="anonymous"`. Videos in the library viewer play with sound. A global AudioContext manages background audio playback for photo viewing, with intelligent pause/resume and automatic track advancement, persisting state across tab switches. iOS compatibility includes specific autoplay and playback fixes, default muted videos, and performance optimizations like reduced prefetch and async decoding. **iOS Touch Handling:** Native touch event listeners attached directly to video/image elements to bypass Safari's touch event suppression. Dual tracking (React state + refs) prevents lag, iOS device detection prevents duplicate handlers on Android, and useEffect dependencies ensure fresh listeners on every media change.
- **Library Features:** The Library view includes "Songs" and "Chat" tabs. The "Songs" tab dynamically loads and allows playback of audio from `audio-list.json`, supporting multi-select for custom playlist creation. The "Chat" tab displays filtered Google Chat conversations parsed from an MBOX file, presented as collapsible cards with sender-specific styling and intelligent date extraction.
- **Video Processing:** Automated build-time conversion script uses FFmpeg to process all video formats, including resolution reduction for files over 100MB, specific codecs, and web optimization. Existing MP4 files over 100MB are also processed.
- **PWA & Deployment:** The application is built as a Progressive Web App (PWA) with offline capabilities. Icons and favicon are generated from a source image (biriyani.jpg). Automated GitHub Pages deployment script handles video conversion, Vite build, path fixing, cache-busting, media/PWA config copying, and git operations for deployment. Search engine protection is implemented via `robots.txt` and meta tags.
- **Caching:** IndexedDB-based caching for all media, with automatic prefetching of next items. Blob URLs are properly tracked and revoked to prevent memory leaks. LocalStorage-based caching is used for other media aspects, with a 24-hour validity and version-based invalidation. HTTP cache-busting uses timestamp query parameters and `no-store`/`no-cache` headers. Cache size is limited to 100MB for iOS compatibility, with proactive cleanup and quota error handling.
- **UX Enhancements:** Reels position is preserved when switching views. The browser back button works contextually, and a hard refresh redirects to the landing page, ensuring the birthday message is seen on app entry. Pull-to-refresh behavior has been fixed to prevent unwanted navigation.
- **Build & Deployment:** Streamlined build scripts for GitHub Pages, including automated LFS download using GitHub PAT.

### System Design Choices
- **Fully Static Frontend:** No backend server or authentication, enabling deployment to any static hosting.
- **Mock Data Strategy:** Unsplash images as fallback mock media for development, decoupling frontend from real data.
- **LocalStorage for Persistence:** Liked media status is stored client-side, simplifying implementation but not syncing across devices.
- **Favorite Sorting:** Liked media automatically float to the top in the Library view, consistently applied across all filters.
- **Dynamic Content:** Content lists are generated from local files at build time, simplifying content updates.

## External Dependencies
- **Database:** Neon Serverless PostgreSQL (via `@neondatabase/serverless`) for potential future use.
- **UI Libraries:** Shadcn UI, Radix UI, Tailwind CSS.
- **Routing:** Wouter.
- **State Management/Data Fetching:** TanStack Query (React Query).
- **Animations:** Canvas Confetti.
- **Form Handling:** React Hook Form with Zod resolvers.
- **Date Utilities:** Date-fns.
- **Video Conversion:** FFmpeg (system dependency).
- **Image Processing:** Sharp library for thumbnail generation and optimization.
- **Version Control:** Git LFS for large media files (e.g., .mp4, .mov, .mp3, .wav, .mbox, chat-list.json).