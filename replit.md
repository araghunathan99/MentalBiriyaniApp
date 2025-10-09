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
- Full-screen Reels feed with vertical swipe navigation
  - Media randomized on each app load for variety
  - Different order every session using Fisher-Yates shuffle
- Grid view with filtering (All/Photos/Videos)
  - Maintains original chronological order
- Library viewer for grid items with navigation controls (Back to Library, Previous, Next)
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

1. **Media Loading**: 
   - App fetches `public/content/media-list.json` on startup
   - Parses JSON to get list of available media files
   - Constructs local URLs: `/content/{filename}`
   - Loads media into React state → UI components
   
2. **Media Display**:
   - Images and videos loaded directly from `/content/` folder
   - No authentication or API calls required
   - All files served as static assets
   
4. **User Interactions**: Component events → LocalStorage (likes) → UI updates

5. **Sharing**: URL-based routing → ShareView page → Fetch specific media item

### Key Architectural Decisions

**Mock Data Strategy**
- Fallback mock media using Unsplash images for development
- Enables frontend development without Google Drive setup
- Seamless transition to real Google Drive data

**Storage Approach**
- LocalStorage for liked media (client-side only, no backend persistence)
- Simplifies implementation and reduces server dependencies
- Trade-off: likes don't sync across devices

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