# Design Guidelines: Instagram Reels-Like Mobile App

## Design Approach
**Reference-Based: Instagram/TikTok Pattern**
Drawing from Instagram Reels' immersive mobile experience, with dark-first UI optimized for media consumption. Focus on gesture-driven interactions, minimal chrome, and content-forward design.

## Core Design Principles
1. **Content Supremacy**: Media takes 100% viewport, UI overlays fade when inactive
2. **Gesture-First**: Swipe, tap, and hold interactions over traditional buttons
3. **Instant Feedback**: Every interaction has immediate visual/haptic response
4. **Performance**: Smooth 60fps animations, preloading, and optimistic UI updates

## Color Palette

### Dark Theme (Primary)
- **Background**: 0 0% 8% (deep black, Instagram-style)
- **Surface**: 0 0% 12% (elevated panels)
- **Surface Elevated**: 0 0% 16% (modals, bottom sheets)
- **Text Primary**: 0 0% 98%
- **Text Secondary**: 0 0% 65%
- **Dividers**: 0 0% 20%

### Interactive Elements
- **Like/Heart**: 340 82% 52% (Instagram pink-red)
- **Primary Action**: 200 100% 50% (bright blue for CTAs)
- **Success**: 142 76% 36%
- **Overlay**: 0 0% 0% / 40% (semi-transparent backdrop)

## Typography
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto)
- **Display (Tab labels)**: 14px, 600 weight, tracking-tight
- **Media Title**: 15px, 500 weight
- **Metadata**: 13px, 400 weight, text-secondary
- **Counts**: 12px, 600 weight

## Layout System

### Spacing Primitives
Core spacing units: **2, 3, 4, 6, 8** (Tailwind units)
- Tight spacing: p-2, gap-2
- Standard spacing: p-4, gap-4  
- Section spacing: py-6, py-8
- Safe areas: pb-8 (bottom navigation clearance)

### Grid System
- **Reels Feed**: Full viewport (100vw x 100vh), single column
- **Grid View**: 3-column grid on mobile (grid-cols-3), gap-1
- **Safe Areas**: Account for iPhone notch (pt-safe, pb-safe)

## Component Library

### A. Navigation
**Bottom Tab Bar** (Instagram pattern):
- Fixed bottom position with blur backdrop (backdrop-blur-xl bg-surface/80)
- Two tabs: "Reels" (play icon) + "Library" (grid icon)
- Active state: Icon filled + indicator line (h-0.5 bg-primary)
- Height: 56px with safe area padding

### B. Reels Feed View
**Full-Screen Media Container**:
- Absolute positioned overlays, no visible chrome by default
- Video: object-cover, auto-play, loop, muted by default
- Images: object-cover with subtle ken-burns zoom on load

**Interaction Overlays** (fade in on tap):
- **Top Bar**: User info, timestamp, Google Drive source (bg-gradient-to-b from-black/60)
- **Side Actions** (right edge, vertical stack):
  - Heart/Like button (bottom): scale animation on tap, fill with pink
  - Share button: native share icon, slide-up animation
  - Count bubbles: white text on semi-transparent pill
- **Bottom Info**: Caption/filename, swipe-up affordance (bg-gradient-to-t from-black/60)

**Gesture Zones**:
- Tap center: Play/pause video, show/hide overlays
- Swipe vertical: Next/previous media with momentum
- Double-tap: Quick like (heart burst animation)
- Long-press: Show metadata sheet

### C. Grid Library View
**Category Tabs** (horizontal scroll):
- Pills: "All" | "Photos" | "Videos" 
- Active: bg-surface-elevated, inactive: transparent
- Smooth scroll, snap-to-center

**Media Grid**:
- 3-column mosaic (aspect-square)
- Video thumbnails: play icon overlay (bottom-right)
- Liked items: small heart badge (top-right)
- Tap: Navigate to Reels view at selected item

**Virtual Scroll**: Load 30 items initially, infinite scroll with intersection observer

### D. Interactive Elements
**Like Button Animation**:
- Idle: Outline heart, stroke-2
- Active: Filled heart, scale(1.2) → scale(1), color transition
- Burst effect: Radiating particles on double-tap like

**Share Action**:
- Generates deep link: `/media/:driveFileId`
- Shows bottom sheet with native share + copy link
- Toast confirmation: "Link copied" (3s duration)

**Loading States**:
- Skeleton screens in grid (bg-surface animate-pulse)
- Spinner overlay for media loading (backdrop-blur-sm)
- Progressive image loading (blur-up technique)

## Animations & Transitions

### Motion Principles
- **Duration**: Fast (150ms) for interactions, Standard (300ms) for page transitions
- **Easing**: ease-out for entrances, ease-in for exits
- **Transform**: Prefer translate/scale over position/size changes

### Key Animations
1. **Swipe Transition**: translateY with rubber-band resistance at edges
2. **Like Heart**: scale(0.8) → scale(1.2) → scale(1), 400ms
3. **Tab Switch**: crossfade (opacity), 200ms
4. **Media Load**: fade-in + slight scale-up, 300ms
5. **Bottom Sheet**: translateY from 100% with spring physics

## Accessibility & Performance

### Touch Targets
- Minimum 44x44px tap areas
- Extended hit zones for floating action buttons
- Swipe gesture dead zones (50px from edges)

### Dark Mode Optimizations
- Pure black (#000) for OLED power saving
- Reduced motion: Disable parallax and scale animations (prefers-reduced-motion)
- High contrast mode: Increase text/icon contrast to 7:1

### Performance Budget
- Video preload: Next 2 items in feed direction
- Image lazy loading: Intersection observer with 200px margin
- Local storage: Like states persist, max 5MB quota
- Debounced scroll: 16ms throttle for smooth 60fps

## Media Handling

### Video Playback
- Auto-play when in viewport (IntersectionObserver)
- Muted by default, tap to unmute (volume icon overlay)
- Loop seamlessly, preload="metadata"
- Picture-in-picture on background (optional)

### Image Display
- Responsive srcset for drive thumbnails
- Blur-up loading (base64 placeholder)
- Pinch-to-zoom gesture support
- EXIF metadata display in bottom sheet

### Google Drive Integration
- Fetch media: Images (jpg, png, heic) + Videos (mp4, mov)
- Thumbnail optimization: Request medium size for grid
- Error states: "Unable to load" with retry button
- Offline mode: Show cached likes, disable new fetches

## Critical UI Patterns

**Empty States**:
- No media: Large cloud upload icon + "Connect Google Drive" CTA
- No likes: Heart outline + "Like photos to save them here"

**Error Handling**:
- Network error: Toast notification, auto-retry (3 attempts)
- Auth expired: Bottom sheet prompting re-authentication

**Pull-to-Refresh**: 
- Top of grid view only
- Circular loading indicator, haptic feedback on trigger

This design creates an immersive, gesture-driven media consumption experience that feels native to mobile while maintaining Instagram Reels' intuitive interaction patterns.