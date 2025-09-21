// Dice roll logging and history

export interface RollLog {
  id: string;
  actor: string; // ID of actor
  type: "attack" | "damage" | "saving throw" | "ability check" | "skill check" | "death save" | "other";
  dice: string; // e.g., "1d20+5"
  result: number;
  naturalRoll: number; // 1-20 for d20 rolls
  modifier: number;
  advantage?: boolean;
  disadvantage?: boolean;
  success?: boolean;
  target?: string; // ID of target
  description: string;
  timestamp: Date;
}
