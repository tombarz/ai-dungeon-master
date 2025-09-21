# Models Package - Clean Domain Architecture

Comprehensive domain types and Zod schemas for the AI Dungeon Master application, organized into clean, maintainable domain-specific modules.

## 🏗️ Architecture

The models package is organized into logical domain areas, making the codebase more maintainable and easier to navigate:

```
packages/models/src/
├── core/                    # Core D&D mechanics
│   ├── abilities.ts         # Ability scores and ability keys
│   ├── conditions.ts        # Status conditions
│   ├── damage.ts           # Damage types and damage rolls
│   ├── stats.ts            # Stat blocks and core statistics
│   └── index.ts            # Core domain exports
├── character/              # Character domain
│   ├── character.ts        # Player character definition
│   ├── classes.ts          # Character classes and features
│   ├── equipment.ts        # Items, weapons, armor
│   ├── spells.ts           # Magic and spellcasting
│   └── index.ts            # Character domain exports
├── combat/                 # Combat mechanics
│   ├── actions.ts          # Combat actions and abilities
│   ├── effects.ts          # Effects and status tracking
│   ├── encounters.ts       # Combat encounters and initiative
│   └── index.ts            # Combat domain exports
├── creatures/              # NPCs and monsters
│   ├── npc.ts              # Non-player characters
│   ├── monster.ts          # Monsters and challenging creatures
│   └── index.ts            # Creatures domain exports
├── campaign/               # Campaign management
│   ├── campaign.ts         # Campaign definition
│   ├── party.ts            # Party state and management
│   ├── quests.ts           # Quest flags and canon facts
│   └── index.ts            # Campaign domain exports
├── logging/                # Game history
│   ├── turn-log.ts         # Turn-by-turn action logging
│   ├── roll-log.ts         # Dice roll history
│   └── index.ts            # Logging domain exports
├── session/                # Game sessions
│   ├── session.ts          # Session management
│   └── index.ts            # Session domain exports
├── versioning/             # Migration support
│   ├── versioned.ts        # Versioned types for schema evolution
│   └── index.ts            # Versioning exports
├── schemas/                # Zod validation schemas
│   ├── core.ts             # Core D&D schemas
│   ├── character.ts        # Character validation
│   ├── combat.ts           # Combat validation
│   ├── creatures.ts        # Creature validation
│   ├── campaign.ts         # Campaign validation
│   ├── logging.ts          # Logging validation
│   ├── session.ts          # Session validation
│   ├── versioning.ts       # Versioned schema support
│   └── index.ts            # Schema exports + parsers
└── index.ts                # Main barrel export
```

## 🎯 Domain Organization

### Core Domain (`/core`)
Fundamental D&D mechanics that are used across all other domains:
- **Abilities**: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- **Damage Types**: All 13 D&D damage types with proper typing
- **Conditions**: All standard D&D conditions
- **Stat Blocks**: Universal creature statistics

### Character Domain (`/character`)
Everything related to player characters:
- **Character**: Complete character definition with progression
- **Classes**: Character classes, features, hit dice, death saves
- **Equipment**: Weapons, armor, tools, magical items
- **Spells**: Magic system with schools and components

### Combat Domain (`/combat`)
Combat mechanics and encounter management:
- **Actions**: All types of actions (action, bonus, reaction, legendary)
- **Effects**: Status effects, buffs, debuffs with duration tracking
- **Encounters**: Combat setup, initiative, objectives

### Creatures Domain (`/creatures`)
NPCs and monsters:
- **NPCs**: Non-player characters with roleplay notes
- **Monsters**: Challenge rating, XP, legendary actions

### Campaign Domain (`/campaign`)
Campaign-level game state:
- **Campaign**: Overall campaign management
- **Party**: Group dynamics, reputation, shared resources
- **Quests**: Quest flags, canon facts, world building

### Logging Domain (`/logging`)
Game history and audit trails:
- **Turn Log**: Action-by-action combat history
- **Roll Log**: Dice roll history with advantage/disadvantage

### Session Domain (`/session`)
Individual game sessions:
- **Session**: Session management with participants and duration

### Versioning Domain (`/versioning`)
Migration support for schema evolution:
- **Versioned**: Generic wrapper for versioned data structures

## 🔧 Usage

### Import by Domain
```typescript
// Import specific domains
import { Character, Equipment } from '@ai-dungeon-master/models/character';
import { Action, EffectInstance } from '@ai-dungeon-master/models/combat';
import { Campaign, QuestFlag } from '@ai-dungeon-master/models/campaign';

// Or import everything
import { Character, Action, Campaign } from '@ai-dungeon-master/models';
```

### Type-Safe Parsing
```typescript
import { 
  parseCharacter, 
  parseMonster, 
  parseSession 
} from '@ai-dungeon-master/models';

// Validate character data
const character = parseCharacter(rawCharacterData);

// Validate monster data
const monster = parseMonster(rawMonsterData);

// Validate session data
const session = parseSession(rawSessionData);
```

### Schema Validation
```typescript
import { 
  characterSchema, 
  encounterStateSchema,
  campaignSchema 
} from '@ai-dungeon-master/models';

// Use schemas directly for validation
const result = characterSchema.safeParse(data);
if (result.success) {
  // data is valid Character
  console.log(result.data.name);
} else {
  // Handle validation errors
  console.error(result.error.issues);
}
```

## ✅ Validation Features

### Numeric Constraints
- **Ability Scores**: 1-30 (standard D&D range)
- **Armor Class**: 5-35 (reasonable game range)
- **Hit Points**: ≥ 0 (cannot be negative)
- **Character Level**: 1-20 (standard D&D progression)
- **Challenge Rating**: 0-30 (covers all official monsters)

### Cross-Field Validation
- **Used Resources**: Cannot exceed maximum (e.g., used hit dice ≤ total hit dice)
- **Effect Duration**: Remaining rounds ≤ total duration
- **Legendary Resistances**: Used ≤ total legendary resistances

### Array Defaults
All optional collections default to empty arrays for consistent data handling.

### UUID Validation
All entity IDs must be valid UUIDs for proper referential integrity.

## 🧪 Testing

```bash
cd packages/models
npx vitest run
# ✓ 39/39 tests passing
```

### Test Coverage
- ✅ All domain types with happy/invalid paths
- ✅ Cross-field validation rules
- ✅ Array defaults and optional fields
- ✅ Edge cases (min/max values, zero values)
- ✅ Snapshot testing for regression protection

## 🔄 Migration Support

Built-in versioning support for schema evolution:

```typescript
import { VersionedSession, VersionedCampaign } from '@ai-dungeon-master/models';

const versionedSession: VersionedSession = {
  version: 1,
  data: session
};

// Future migrations can detect version and transform data accordingly
```

## 🚀 Benefits of This Architecture

### Maintainability
- **Single Responsibility**: Each file has a clear, focused purpose
- **Logical Grouping**: Related types are co-located
- **Easy Navigation**: Intuitive file structure

### Scalability
- **Incremental Development**: Add new domains without affecting existing ones
- **Team Collaboration**: Different developers can work on different domains
- **Feature Isolation**: Domain boundaries prevent coupling

### Type Safety
- **Comprehensive Validation**: Runtime type checking with Zod
- **Compile-Time Safety**: Full TypeScript support
- **Error Handling**: Detailed validation error messages

### Performance
- **Tree Shaking**: Import only what you need
- **Lazy Loading**: Load specific domains on demand
- **Optimized Bundling**: Smaller bundle sizes in applications

This architecture provides a solid foundation for the AI Dungeon Master MVP while maintaining clean code organization and excellent developer experience.