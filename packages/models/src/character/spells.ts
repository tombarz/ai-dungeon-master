// Spells and magic

export interface Spell {
  name: string;
  level: number; // 0-9
  school: "abjuration" | "conjuration" | "divination" | "enchantment" | "evocation" | "illusion" | "necromancy" | "transmutation";
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
  higherLevels?: string;
  ritual?: boolean;
  concentration?: boolean;
}
