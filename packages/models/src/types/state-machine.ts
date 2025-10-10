import type { Ability } from "./core";
import type { PlayerCharacter } from "./entities";

export type CharacterField =
  | "name"
  | "race"
  | "class"
  | "level"
  | "abilities"
  | "ac"
  | "maxHP"
  | "hp"
  | "backstory";

export interface CharacterQuestion {
  field: CharacterField;
  prompt: string;
}

export interface CharacterDraft
  extends Partial<
    Pick<
      PlayerCharacter,
      "id" | "kind" | "name" | "race" | "class" | "level" | "abilities" | "ac" | "maxHP" | "hp" | "backstory"
    >
  > {}

export interface CompleteCharacterDraft extends CharacterDraft {
  id: string;
  kind: "character";
  name: string;
  race: string;
  class: string;
  level: number;
  abilities: Record<Ability, number>;
  ac: number;
  maxHP: number;
  hp: number;
  backstory: string;
}

export type CharacterUpdate = Partial<
  Pick<
    PlayerCharacter,
    "name" | "race" | "class" | "level" | "abilities" | "ac" | "maxHP" | "hp" | "backstory"
  >
>;
