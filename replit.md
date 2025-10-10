# MentalBiriyani - A Curated Nostalgia Ride

## Overview

MentalBiriyani is "A curated nostalgia ride that is like biriyani for the mind! #DD40" - an Instagram Reels-inspired mobile web application that displays photos and videos from a local content folder in an immersive, swipeable feed. The app features a dark-first UI with gesture-driven interactions, allowing users to view media in both a full-screen Reels view and a grid library view. Users can like media items, with preferences stored locally, and share individual items via unique URLs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (no React Router)
- TanStack Query (React Query) for server state management

**UI Component System**
- Shadcn UI components (New York style) built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Dark-first color scheme optimized for media consumption
- Mobile-optimized layout with gesture-based interactions (swipe navigation)

**Key UI Patterns**
- Loading screen on initial app load
  - Full-screen biriyani.jpeg image (scaled to fit with object-cover)
  - Dark gradient overlay for text visibility
  - White heading text with drop shadow
  - Golden yellow subtitle (#FFD700) with drop shadow
  - Floating particle effects
  - Shows for 2 seconds before landing page
  - Text: "Mental Biriyani - Preparing your nostalgia ride..."
- Full-screen Reels feed with vertical swipe navigation
  - Media randomized on each app load for variety
  - Different order every session using Fisher-Yates shuffle
  - Instagram-like swipe transitions (current item moves up with swipe)
  - Reduced swipe threshold (50px) for faster, more responsive navigation
  - Smooth 300ms ease-out animation on swipe completion
  - Real-time transform applied during swipe gesture
  - Automatic prefetching of next 10 media items in parallel for instant loading
- Grid view with filtering (All/Photos/Videos)
  - Liked media automatically bubble to the top
  - Favorite sorting applies to all filter views (All, Photos, Videos)
- Library viewer for grid items with gesture and keyboard controls
  - Mobile: Swipe up/left for next, swipe down/right for previous
  - Web: Arrow keys (↑↓←→) for navigation
  - Back to Library button in top-left corner
  - Clean, minimal interface with no bottom controls
- Bottom navigation for tab switching
- Toast notifications for user feedback
- Responsive design with mobile-first approach
- Tap-to-toggle controls: First tap shows controls, second tap hides them
- Bottom slider navigation: Click left/right areas to navigate reels

**State Management Strategy**
- Local state with React hooks (useState, useRef)
- Server state cached via TanStack Query
- LocalStorage for persisting user preferences (liked media)
- No global state management library needed

### Architecture Model

**Fully Static Frontend Application**
- No backend server or authentication required
- All media loaded from local `public/content` folder
- Can be deployed to any static hosting (Netlify, Vercel, GitHub Pages, etc.)
- Works as Progressive Web App (PWA) with offline capability
- Simple JSON-based media configuration

### Local Media System

**Content Folder Structure**
- Media files stored in `public/content/` folder
- Configuration file: `public/content/media-list.json`
- Supports images (jpg, png, webp) and videos (mp4, webm)
- No external API dependencies
- No authentication needed

**Database Service** (Not Used for Media)
- Neon Serverless PostgreSQL via `@neondatabase/serverless`
- Connection managed through `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations (output: `./migrations`)

**Client-Side Libraries**
- Canvas Confetti for celebration animations (landing page)
- React Hook Form with Zod resolvers for form validation
- Date-fns for date manipulation

**Development Tools**
- Replit-specific plugins: runtime error overlay, cartographer, dev banner
- ESBuild for server-side bundling in production
- PostCSS with Autoprefixer for CSS processing

### Data Flow

1. **App Initialization**:
   - Loading screen displays for 2 seconds with biriyani image
   - Landing page loads after loading screen
   
2. **Media Loading**: 
   - App fetches `public/content/media-list.json` on startup
   - Parses JSON to get list of available media files
   - Constructs local URLs: `/content/{filename}`
   - Loads media into React state → UI components
   - Media randomized using Fisher-Yates shuffle
   
3. **Media Display**:
   - Images and videos loaded directly from `/content/` folder
   - No authentication or API calls required
   - All files served as static assets
   
4. **Media Prefetching** (Reels Mode):
   - Automatically prefetches next 10 media items in parallel
   - Tracks prefetched items using Set to avoid duplicates
   - Videos: Creates video element with preload='auto', waits for loadeddata
   - Images: Creates Image object, waits for onload
   - Timeouts: 5 seconds for videos, 3 seconds for images
   - Runs whenever current index changes
   - Enables instant loading when swiping to next items
   
5. **User Interactions**: Component events → LocalStorage (likes) → UI updates

6. **Sharing**: URL-based routing → ShareView page → Fetch specific media item

### Key Architectural Decisions

**Mock Data Strategy**
- Fallback mock media using Unsplash images for development
- Enables frontend development without Google Drive setup
- Seamless transition to real Google Drive data

**Storage Approach**
- LocalStorage for liked media (client-side only, no backend persistence)
- Simplifies implementation and reduces server dependencies
- Trade-off: likes don't sync across devices

**Favorite Sorting**
- Liked media automatically bubble to the top in Library view
- Sorting uses `isMediaLiked()` to check localStorage
- Applied consistently across all filter views:
  - All: Liked items (photos + videos) appear first
  - Photos: Liked photos appear before unliked photos
  - Videos: Liked videos appear before unliked videos
- Maintains original order within liked/unliked groups
- Updates dynamically when likes are toggled in Reels view

**Mobile-First Design**
- Touch gesture handlers (swipe, tap, hold)
- Full viewport media display (100vw × 100vh)
- Safe area handling for notched devices
- Auto-hiding controls with timeout

**Video Playback**
- Muted autoplay by default (mobile browser compliance)
- Play/pause toggle on tap
- Volume control available but not persistent
- Desktop: Draggable progress bar for video seeking
- Desktop: Keyboard navigation (Arrow Up/Down/Left/Right)
- Desktop: Scroll wheel navigation support
- Progress bar validates video duration is finite before seeking
- Video attributes: `playsInline`, `loop` for optimal mobile experience

**Automated Video Conversion**
- Build-time conversion from QuickTime (.mov) to MP4 (H.264 + AAC)
- FFmpeg installed as system dependency (v6.1.1)
- Smart resolution handling:
  - Downscales to max 1280px (720p equivalent) only if needed
  - Preserves aspect ratio (landscape/portrait aware)
  - Keeps videos < 1280px at original resolution
- Conversion settings:
  - Video codec: H.264 (libx264) with CRF 23
  - Audio codec: AAC at 128kbps
  - Preset: fast (balanced speed/quality)
  - Web optimization: faststart flag for progressive streaming
- Automatic media-list.json updates (file extensions and MIME types)
- Old .mov files deleted after successful conversion
- Scripts:
  - `scripts/convert-videos.js` - Automatic conversion (runs during build)
  - `convert-videos-manual.sh` - Manual conversion option
  - `build-github-pages.sh` - Full pipeline with video conversion and deployment
- Browser compatibility improvement:
  - Before: Safari/iOS only (QuickTime .mov)
  - After: All browsers (MP4/H.264)
- File size reduction: ~35% smaller (164MB → 106MB for current videos)

**Automated GitHub Pages Deployment**
- One-command build and deploy: `./build-github-pages.sh --deploy`
- Automated git repository initialization in `dist/public/`
- Interactive or environment-based GitHub repository configuration
- Timestamped commits for tracking deployments
- Force push to GitHub Pages repository (main branch)
- Command-line flags:
  - `--deploy` - Auto-deploy to GitHub after build
  - `--skip-video` - Skip video conversion for faster builds
  - `--help` - Show usage information
- Environment variable support: `GITHUB_PAGES_REPO`
- Build steps (7 total):
  1. Video conversion (.mov → .mp4)
  2. Vite build (optimized React app)
  3. Path fixing (prepends /MentalBiriyani/ for GitHub Pages)
  4. Media file copying
  5. PWA configuration copying
  6. Documentation copying
  7. Git commit and push (if --deploy flag used)
- Deployment output: Complete package in `dist/public/` ready for GitHub Pages
- Documentation:
  - `GITHUB_PAGES_DEPLOYMENT.md` - Complete deployment guide
  - `BUILD_FOR_GITHUB_PAGES.md` - Build documentation
  - Auto-generated `README.md` in dist/public with deployment instructions

**Media Caching & Cache Invalidation**
- LocalStorage-based caching with automatic size management
- Cache validity period: 24 hours
- Version-based cache invalidation:
  - Detects changes via `version` or `lastModified` field in media-list.json
  - Automatically clears cache when version changes
  - Supports both versioned (object) and legacy (array) JSON formats
- HTTP cache-busting:
  - Timestamp query parameter prevents browser caching
  - `no-store` and `no-cache` headers for fresh data
- Automatic cache eviction when storage is full
- Fallback to cached data when network fails