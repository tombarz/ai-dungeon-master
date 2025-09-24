# Models Package - Minimal MVP with Logical Organization

Clean, minimal domain types and Zod schemas for the AI Dungeon Master MVP, organized into logical domains for better maintainability while keeping the exact same public API.

## 🏗️ Architecture

The models package provides the essential types and schemas for the AI Dungeon Master MVP, organized into three logical domains:

```
packages/models/src/
├── index.ts                    # Main barrel exports
├── types.ts                    # Re-exports from types/ subdirectory
├── schemas.ts                  # Re-exports from schemas/ subdirectory
├── types/                      # Organized type definitions
│   ├── core.ts                 # Core enums & primitives (25 lines)
│   ├── entities.ts             # Creatures & stat blocks (43 lines)
│   ├── game-state.ts           # Party, encounters, sessions (120 lines)
│   └── index.ts                # Re-exports all types
└── schemas/                    # Organized Zod schemas
    ├── core.ts                 # Core schemas (45 lines)
    ├── entities.ts             # Entity validation (45 lines)
    ├── game-state.ts           # Game state validation (95 lines)
    └── index.ts                # Re-exports all schemas & parsers
```

## 🎯 Domain Organization

### Core Domain (`/types/core`)
Fundamental types used across the entire application:
- **ID**: Unique identifiers for all entities
- **Ability**: The six core D&D abilities (STR, DEX, CON, INT, WIS, CHA)
- **DamageType**: All 13 D&D damage types with proper typing
- **Condition**: All standard D&D status conditions
- **Speaker**: AI, PLAYER, SYSTEM for conversation tracking
- **Language**: Supported languages (en, he)
- **Rating**: Content rating system (E, PG-13, R)

### Entities Domain (`/types/entities`)
Everything related to creatures and characters:
- **StatBlock**: Universal creature statistics (AC, HP, abilities)
- **Creature**: Any character or creature with inventory and conditions
- **CreatureKind**: Type classification (character, npc, monster)

### Game State Domain (`/types/game-state`)
Campaign and session management:
- **PartyState**: Adventuring party with characters and companions
- **EncounterState**: Combat encounters with initiative and effects
- **Session**: Individual game sessions with timeline and state
- **Campaign**: Overall campaign with settings and canon facts
- **TurnLog**: Conversation history with speaker and timestamp
- **RollLog**: Dice roll history with provable fairness

## 🔧 Usage

### Same API as Before
```typescript
// Still works exactly the same - no breaking changes
import { Session, Creature, zSession, parseSession } from '@ai-dungeon-master/models';

// Use types
const session: Session = {
  id: "123",
  campaignId: "456",
  seed: "test",
  timeline: [],
  state: { party: { characters: [] } },
  updatedAt: new Date().toISOString()
};

// Validate data
const validSession = parseSession(sessionData);
```

### Type-Safe Validation
```typescript
import { zSession, zCreature, parseSession } from '@ai-dungeon-master/models';

// Runtime validation with detailed errors
const result = zSession.safeParse(rawData);
if (result.success) {
  // TypeScript knows this is Session
  console.log(result.data.party.characters.length);
} else {
  // Detailed validation errors
  console.error(result.error.issues);
}
```

## ✅ Validation Features

### Core Constraints
- **Ability Scores**: 1-30 (standard D&D range)
- **Armor Class**: 5-35 (reasonable game range)
- **Hit Points**: 0 to maxHP (cannot exceed maximum)
- **UUIDs**: All IDs must be valid UUIDs

### Cross-Field Validation
- **HP Bounds**: Current HP cannot exceed maximum HP
- **Initiative Integrity**: Active creature must be in initiative order
- **Entity References**: All initiative IDs must exist in entities map
- **Party Constraints**: Characters must have kind='character'

### Array Defaults
All optional collections default to empty arrays for consistent data handling.

## 🧪 Testing

```bash
cd packages/models
npx vitest run
# ✓ 14/14 tests passing
```

### Test Coverage
- ✅ Happy path session parsing with snapshot
- ✅ Cross-field validation (HP bounds, initiative integrity)
- ✅ Party constraints (character kind validation)
- ✅ Abilities coverage (all 6 abilities required, 1-30 range)
- ✅ ISO date validation (proper format required)
- ✅ Array defaults verification
- ✅ Canon summary validation (non-empty after trim)

## 🚀 Benefits

### Perfect Balance
- **Minimal Scope**: Only essential MVP types and schemas
- **Logical Organization**: Clear separation of concerns
- **Zero Breaking Changes**: Same API, same imports
- **Better Maintainability**: Smaller, focused files
- **Team Ready**: Structure for future growth

### Future-Proof
This organization sets up the codebase for scaling:
- Easy to add new domains when needed
- Clear boundaries for team collaboration
- Logical file structure for navigation
- Maintained separation of concerns

## 🔄 Migration

**Zero Breaking Changes Required:**
- All existing imports continue to work unchanged
- Same exports available with same names
- Same validation behavior and error messages
- Same test coverage and functionality

This minimal but well-organized structure provides the perfect foundation for the AI Dungeon Master MVP!