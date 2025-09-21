# Engine Package

Pure functions for dice rolling, rules engine, and encounter controller.

## Overview

This package contains all the game mechanics and calculations as pure functions, making them easy to test and reason about. It includes:

- Dice rolling utilities with advantage/disadvantage
- Ability score calculations and modifiers
- Combat calculations (AC, HP, attack bonuses, damage)
- Encounter difficulty assessment
- Initiative tracking

## Key Classes

### DiceRoller
Singleton class for all dice rolling operations:
- `rollD20()` - Standard d20 roll
- `rollD20WithAdvantage()` - Roll with advantage
- `rollD20WithDisadvantage()` - Roll with disadvantage
- `rollMultiple(count, sides)` - Roll multiple dice
- `rollWithModifier(sides, modifier)` - Roll with modifiers

### AbilityScoreCalculator
Static methods for ability score management:
- `getModifier(score)` - Calculate ability modifier
- `rollForAbilityScore()` - Roll 4d6 drop lowest
- `rollAbilityScores()` - Generate all six ability scores

### CombatCalculator
Static methods for combat calculations:
- `calculateArmorClass(base, dexMod, armorBonus)` - Calculate AC
- `calculateHitPoints(hitDie, level, conMod)` - Calculate HP
- `calculateProficiencyBonus(level)` - Calculate proficiency bonus
- `calculateAttackBonus(abilityMod, profBonus, weaponBonus)` - Calculate attack bonus
- `calculateDamage(diceCount, diceSize, abilityMod, weaponBonus)` - Calculate damage

### EncounterCalculator
Static methods for encounter management:
- `calculateEncounterDifficulty(partyLevel, partySize, encounterXP)` - Assess difficulty

### InitiativeTracker
Class for managing combat initiative:
- `addParticipant(id, initiative)` - Add to initiative order
- `getOrder()` - Get sorted initiative order
- `getCurrentTurn(order, currentIndex)` - Get current turn participant

## Usage

```typescript
import { diceRoller, AbilityScoreCalculator, CombatCalculator } from "@ai-dungeon-master/engine";

// Roll dice
const attackRoll = diceRoller.rollD20WithAdvantage();
console.log(`Attack roll: ${attackRoll.total}`);

// Calculate ability modifier
const strModifier = AbilityScoreCalculator.getModifier(16); // Returns 3

// Calculate combat stats
const ac = CombatCalculator.calculateArmorClass(10, 2, 3); // Returns 15
const hp = CombatCalculator.calculateHitPoints(10, 5, 2); // Returns 5d10 + 10

// Roll damage
const damage = CombatCalculator.calculateDamage(1, 8, 3, 0); // 1d8 + 3
```

## Dependencies

- `@ai-dungeon-master/models` - For type definitions
