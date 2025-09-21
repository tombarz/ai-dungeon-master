# Mobile App

Expo React Native mobile application for AI Dungeon Master.

## Overview

This is the mobile version of the AI Dungeon Master application, built with Expo and React Native, featuring:

- Cross-platform iOS and Android support
- Expo Router for file-based routing
- Native mobile UI components
- Offline-first architecture
- Push notifications support

## Features

- **Native Mobile Experience**: Optimized for touch interactions
- **Offline Play**: Full functionality without internet connection
- **Character Management**: Mobile-optimized character creation
- **Dice Rolling**: Touch-friendly dice rolling interface
- **Game Sessions**: Join and manage D&D sessions on mobile
- **Cross-Platform Sync**: Synchronize with web version

## Tech Stack

- **Framework**: Expo SDK 49+
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript
- **Database**: SQLite (via expo-sqlite)
- **Build**: EAS Build for app store deployment

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start development server
pnpm dev:mobile

# Run on iOS simulator
expo start --ios

# Run on Android emulator
expo start --android

# Build for production
expo build
```

## Project Structure

```
apps/mobile/
├── app/                     # Expo Router pages
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Home screen
│   └── game.tsx            # Game session screen
├── assets/                  # Images and icons
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration
└── package.json            # Dependencies and scripts
```

## Package Integration

The mobile app integrates with all shared packages:

- `@ai-dungeon-master/models` - Game data types
- `@ai-dungeon-master/engine` - Game mechanics
- `@ai-dungeon-master/orchestrator` - AI integration
- `@ai-dungeon-master/storage` - SQLite storage (future)
- `@ai-dungeon-master/ui` - Native React Native components

## Platform Support

### iOS
- iOS 13.0+
- iPhone and iPad
- App Store deployment ready

### Android
- Android 6.0+ (API level 23)
- Phone and tablet support
- Google Play Store ready

## Development Tools

- **Expo CLI**: Development and building
- **Expo Dev Tools**: Debugging and testing
- **EAS Build**: Cloud building service
- **Expo Snack**: Online code sharing

## App Configuration

The `app.json` file contains Expo-specific configuration:

```json
{
  "expo": {
    "name": "AI Dungeon Master",
    "slug": "ai-dungeon-master",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"]
  }
}
```

## Building and Deployment

### Development Build
```bash
expo build:ios
expo build:android
```

### Production Build (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for app stores
eas build --platform all
```

### App Store Deployment
```bash
# Submit to app stores
eas submit --platform all
```

## Features in Development

- **SQLite Integration**: Local database for offline storage
- **Push Notifications**: Game updates and invitations
- **Camera Integration**: Character photo capture
- **Haptic Feedback**: Enhanced touch interactions
- **Dark Mode**: Theme support
