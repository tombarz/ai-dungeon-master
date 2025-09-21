# UI Package

Shared React Native components using react-native-web for web compatibility.

## Overview

This package provides a unified UI component library that works on both React Native (mobile) and web platforms. It includes:

- Base UI components (Button, Card, Input)
- Game-specific components (CharacterCard, GameSessionCard, EncounterCard)
- Dice roller interface
- Consistent styling across platforms

## Base Components

### Button
Configurable button component with variants:
- `primary` - Main action button (blue)
- `secondary` - Secondary action button (gray)
- `danger` - Destructive action button (red)

### Card
Container component for grouping content:
- Consistent shadow and border radius
- Configurable padding
- Cross-platform styling

### Input
Text input component with validation support:
- Single-line and multi-line support
- Placeholder text
- Custom styling

## Game Components

### CharacterCard
Display character information:
- Character name and class
- Level and basic stats
- Optional detailed view
- Touch interaction support

### GameSessionCard
Show game session details:
- Session name and status
- Player count
- Creation date
- Navigation support

### EncounterCard
Display encounter information:
- Encounter name and difficulty
- Description preview
- Enemy count
- Quick access to details

### DiceRoller
Interactive dice rolling interface:
- Configurable dice count, sides, and modifiers
- Visual dice notation (e.g., "2d6+3")
- Roll execution with results display

## Usage

```typescript
import { 
  Button, 
  Card, 
  CharacterCard, 
  DiceRoller 
} from "@ai-dungeon-master/ui";

// Basic components
<Card style={{ margin: 16 }}>
  <Button 
    title="Start Game" 
    onPress={handleStart}
    variant="primary"
  />
</Card>

// Game-specific components
<CharacterCard 
  character={myCharacter}
  onPress={() => navigateToCharacter()}
  showDetails={true}
/>

// Dice roller
<DiceRoller 
  onRoll={(sides, count, modifier) => {
    const result = rollDice(sides, count, modifier);
    console.log(`Rolled: ${result}`);
  }}
/>
```

## Styling

Components use StyleSheet for consistent styling across platforms:
- iOS-style design language
- Responsive layouts
- Accessible color contrast
- Platform-specific optimizations

## Platform Compatibility

### React Native (Mobile)
- Native component rendering
- Touch interactions
- Platform-specific styling
- Performance optimized

### Web (react-native-web)
- DOM rendering
- Mouse/touch events
- CSS styling
- Browser compatibility

## Dependencies

- `react` - React framework
- `react-native` - Mobile framework
- `react-native-web` - Web compatibility
- `@ai-dungeon-master/models` - For type definitions
