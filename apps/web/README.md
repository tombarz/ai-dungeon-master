# Web App

Next.js 14+ web application for AI Dungeon Master with App Router.

## Overview

This is the web version of the AI Dungeon Master application, built with Next.js 14+ and featuring:

- App Router for modern routing
- Tailwind CSS for styling
- Server-side rendering capabilities
- Progressive Web App features
- Cross-platform package integration

## Features

- **Game Session Management**: Create and join D&D sessions
- **Character Creation**: Build and manage D&D characters
- **AI Dungeon Master**: Interactive AI-powered storytelling
- **Dice Rolling**: Built-in dice roller with visual feedback
- **Real-time Updates**: Live game state synchronization
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Testing**: Playwright for E2E testing
- **Build Tool**: Turborepo for monorepo management

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start development server
pnpm dev:web

# Build for production
pnpm build

# Run tests
pnpm test
```

## Project Structure

```
apps/web/
├── src/
│   └── app/                 # App Router pages
│       ├── layout.tsx       # Root layout
│       ├── page.tsx         # Home page
│       └── globals.css      # Global styles
├── public/                  # Static assets
├── e2e/                     # Playwright tests
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies and scripts
```

## Package Integration

The web app integrates with all shared packages:

- `@ai-dungeon-master/models` - Game data types
- `@ai-dungeon-master/engine` - Game mechanics
- `@ai-dungeon-master/orchestrator` - AI integration
- `@ai-dungeon-master/storage` - IndexedDB storage
- `@ai-dungeon-master/ui` - Shared components (react-native-web)

## Deployment

The app can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Docker containers**

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="AI Dungeon Master"
```
