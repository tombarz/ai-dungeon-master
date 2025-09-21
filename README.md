# AI Dungeon Master

An AI-powered dungeon master application built with universal code sharing across web (Next.js) and mobile (Expo React Native) platforms.

## 🎯 Overview

This monorepo contains a complete D&D companion application with an AI dungeon master that can guide players through adventures, manage character stats, handle combat calculations, and provide dynamic storytelling.

## 🏗️ Architecture

### Apps
- **`apps/web`** - Next.js 14+ web application with App Router
- **`apps/mobile`** - Expo React Native mobile application

### Packages
- **`packages/models`** - Domain types and Zod schemas for the game
- **`packages/engine`** - Dice rolling, rules engine, and encounter controller (pure functions)
- **`packages/orchestrator`** - AI agent contracts and orchestration logic
- **`packages/storage`** - Storage interface with drivers for web IndexedDB and mobile SQLite
- **`packages/ui`** - Shared React Native components using react-native-web for web compatibility

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run type checking
pnpm typecheck
```

### Development

```bash
# Start web development server
pnpm dev:web

# Start mobile development server
pnpm dev:mobile

# Run linting
pnpm lint

# Run tests
pnpm test

# Format code
pnpm format
```

## 🛠️ Tech Stack

- **Monorepo**: pnpm + Turborepo
- **TypeScript**: Universal configuration with project references
- **Web**: Next.js 14+, Tailwind CSS, App Router
- **Mobile**: Expo React Native, Expo Router
- **Testing**: Vitest, Playwright (web only)
- **Linting**: ESLint, Prettier
- **Storage**: IndexedDB (web), SQLite (mobile)

## 📦 Package Details

### Models (`@ai-dungeon-master/models`)
Core domain types and Zod schemas for characters, encounters, game sessions, and AI responses.

### Engine (`@ai-dungeon-master/engine`)
Pure functions for dice rolling, combat calculations, ability score management, and encounter difficulty assessment.

### Orchestrator (`@ai-dungeon-master/orchestrator`)
AI agent contracts and game orchestration logic. Currently includes mock implementations for development.

### Storage (`@ai-dungeon-master/storage`)
Abstract storage interface with concrete implementations for web (IndexedDB) and mobile (SQLite) platforms.

### UI (`@ai-dungeon-master/ui`)
Shared React Native components that work on both web and mobile using react-native-web.

## 🎮 Features

- **AI Dungeon Master**: Intelligent AI that guides adventures with dynamic storytelling
- **Character Management**: Create and manage D&D characters with full stat tracking
- **Dice Rolling**: Comprehensive dice rolling system with advantage/disadvantage
- **Combat System**: Automated combat calculations and encounter management
- **Cross-Platform**: Synchronized game state between web and mobile
- **Offline Support**: Local storage for offline play

## 🔧 Scripts

- `pnpm dev:web` - Start web development server
- `pnpm dev:mobile` - Start mobile development server
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Run ESLint across all packages
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run all tests
- `pnpm clean` - Clean all build artifacts

## 📝 License

This project is licensed under the MIT License.
