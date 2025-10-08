# Drive Reels - Instagram-Like Mobile Media Feed

## Overview

Drive Reels is an Instagram Reels-inspired mobile web application that displays photos and videos from Google Drive in an immersive, swipeable feed. The app features a dark-first UI with gesture-driven interactions, allowing users to view media in both a full-screen Reels view and a grid library view. Users can like media items, with preferences stored locally, and share individual items via unique URLs.

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
- Grid view with filtering (All/Photos/Videos)
- Library viewer for grid items with navigation controls (Back to Library, Previous, Next)
- Bottom navigation for tab switching
- Toast notifications for user feedback
- Responsive design with mobile-first approach

**State Management Strategy**
- Local state with React hooks (useState, useRef)
- Server state cached via TanStack Query
- LocalStorage for persisting user preferences (liked media)
- No global state management library needed

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Development: Vite middleware for HMR
- Production: Static file serving from dist/public

**API Structure**
- RESTful endpoints under `/api` prefix
- Mock data fallback for development/demo purposes
- Minimal authentication (user schema exists but not fully implemented)

**Database Layer**
- Drizzle ORM for type-safe database queries
- PostgreSQL as the target database (via Neon serverless connector)
- Schema includes users table (id, username, password)
- Media items are fetched from Google Drive, not stored in database

### External Dependencies

**Google Drive Integration**
- Google Drive API v3 for fetching media files
- OAuth2 authentication (configured for Replit connector)
- Read-only scope: `https://www.googleapis.com/auth/drive.readonly`
- Filters: Images (`mimeType contains "image/"`) and videos (`mimeType contains "video/"`)
- Response includes thumbnails, web links, metadata (name, mimeType, size, modifiedTime)

**Database Service**
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

1. **Media Loading**: Google Drive API → Backend routes → TanStack Query → React components
2. **User Interactions**: Component events → LocalStorage (likes) → UI updates
3. **Sharing**: URL-based routing → ShareView page → Fetch specific media item
4. **Authentication**: Environment-based Google OAuth → Drive client initialization

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

**Media Caching**
- LocalStorage-based caching with 4MB size limit
- Automatic cache eviction when storage is full
- Cache validity period: 24 hours
- Stale-while-revalidate strategy for optimal performance
- Cache automatically updated when fresh data is fetched