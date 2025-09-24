/**
 * Core enums and primitives for the AI Dungeon Master MVP
 */

/** Unique identifier for entities */
export type ID = string;

/** Six core D&D abilities */
export type Ability = 'STR'|'DEX'|'CON'|'INT'|'WIS'|'CHA';

/** Who is speaking in the conversation */
export type Speaker = 'AI'|'PLAYER'|'SYSTEM';

/** Supported languages for the game */
export type Language = 'en'|'he';

/** Content rating for the campaign */
export type Rating = 'E'|'PG-13'|'R';

/** Types of damage in D&D */
export type DamageType = 'bludgeoning'|'piercing'|'slashing'|'fire'|'cold'|'lightning'|'thunder'|'poison'|'acid'|'psychic'|'necrotic'|'radiant'|'force';

/** Status conditions that can affect creatures */
export type Condition = 'prone'|'grappled'|'restrained'|'stunned'|'unconscious'|'poisoned'|'frightened'|'charmed'|'blinded'|'deafened';
