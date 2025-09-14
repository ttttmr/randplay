# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "randplay" (豆瓣随机推荐) - a Next.js 15 web application that provides random recommendations from Douban users' movie and book wishlists. The app scrapes Douban pages to extract wishlist data and displays random selections to help users overcome choice paralysis.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript with React 19
- **Styling**: Tailwind CSS v4 with PostCSS
- **Web Scraping**: Cheerio for HTML parsing
- **Analytics**: Vercel Analytics integration

## Architecture Overview

### Directory Structure
```
src/
├── app/
│   ├── api/          # API routes (movies, books, image proxy)
│   ├── layout.tsx    # Root layout with metadata
│   ├── page.tsx      # Main client component
│   ├── types.ts      # TypeScript interfaces
│   └── globals.css   # Global styles
└── public/           # Static assets
```

### Key Components

**Main Application** (`src/app/page.tsx`):
- Client-side React component with tab switching (movies/books)
- User ID input with localStorage persistence
- Displays random recommendations with images and metadata
- Responsive design using Tailwind CSS

**API Routes**:
- `/api/movies` - Scrapes Douban movie wishlist, returns random 3 movies
- `/api/books` - Scrapes Douban book wishlist, returns random 3 books  
- `/api/image` - Image proxy for doubanio.com domains (CORS workaround)

**Shared Utilities** (`src/app/api/utils/douban.ts`):
- Douban web scraping functionality using Cheerio
- Proper headers to mimic browser requests
- Error handling for HTTP responses

### Data Flow

1. User enters Douban ID → saved to localStorage
2. Frontend calls appropriate API endpoint (`/api/movies` or `/api/books`)
3. API scrapes Douban using web scraping techniques
4. Returns random 3 items from user's wishlist
5. Frontend displays results with proxied images

### Type Definitions

All interfaces are exported from `src/app/types.ts`:
- `Base` - Common fields (id, link, title, pic, year, addedAt)
- `Movie` - Extends Base with movie-specific fields
- `Book` - Extends Base with book-specific fields

### Web Scraping Details

The app uses Cheerio to parse Douban HTML pages:
- Sets proper User-Agent and Accept headers
- Handles Chinese content and encoding
- Extracts structured data from wishlist pages
- Implements error handling for failed requests

### Image Proxy

Since Douban images (`doubanio.com` domain) may have CORS restrictions, the app includes an image proxy at `/api/image` that fetches and serves images to avoid cross-origin issues.

### Development Notes

- The app uses Next.js App Router pattern
- Main page is a client component (`'use client'`) for interactivity
- All API routes are server-side functions
- TypeScript path aliases are configured (`@/*` points to `src/*`)
- Tailwind CSS v4 configuration uses PostCSS