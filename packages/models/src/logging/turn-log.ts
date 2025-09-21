// Turn-by-turn combat and action logging

import type { EffectInstance } from "../combat/effects";

export interface TurnLog {
  id: string;
  turn: number;
  actor: string; // ID of actor
  action: string;
  target?: string; // ID of target
  result: string;
  damage?: number;
  healing?: number;
  effects: EffectInstance[];
  timestamp: Date;
}
