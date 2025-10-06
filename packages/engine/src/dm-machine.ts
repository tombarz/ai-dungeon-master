import { assign, createMachine, interpret } from "xstate";

export type DMStateValue = "SESSION_SETUP" | "EXPLORATION" | "CHECK" | "COMBAT" | "META";
export interface Player { name: string; abilities: Record<string, number>; }
export interface PendingCheck { ability: string; dc: number; reason: string; }
export interface DMContext {
  sessionId: string;
  player?: Player;
  world: { location: string; flags: Record<string, any> };
  pendingCheck?: PendingCheck;
  combat?: { enemies: string[] };
  rng: (formula: string) => number;
  log: string[];
}
export type UserMessageEvent = { type: "USER.MESSAGE"; input: string };
export type SystemSuggestCheckEvent = { type: "SYSTEM.SUGGEST_CHECK"; check: PendingCheck; narration: string };
export type DiceRollResultEvent = { type: "DICE.ROLL_RESULT"; roll: number; formula: string };
export type SystemStartCombatEvent = { type: "SYSTEM.START_COMBAT"; enemies: string[]; narration?: string };
export type SystemEndCombatEvent = { type: "SYSTEM.END_COMBAT"; outcome: "victory" | "defeat" | "flee"; narration?: string };
export type SystemSaveEvent = { type: "SYSTEM.SAVE"; slot?: string };
export type SystemLoadEvent = { type: "SYSTEM.LOAD"; snapshot?: Partial<DMContext> };
export type DMEvent =
  | UserMessageEvent
  | SystemSuggestCheckEvent
  | DiceRollResultEvent
  | SystemStartCombatEvent
  | SystemEndCombatEvent
  | SystemSaveEvent
  | SystemLoadEvent;

type NarrationResult = { narration: string; suggestedCheck?: PendingCheck };
const returnFlag = "__returnState";
const pushLog = (log: string[], entry: string | string[]) => log.concat(entry);

const narrate = (state: DMStateValue, context: DMContext, event: DMEvent): NarrationResult => {
  switch (event.type) {
    case "USER.MESSAGE": {
      const text = event.input.trim();
      if (state === "SESSION_SETUP") return { narration: `Welcome, ${context.player?.name ?? "Adventurer"}. Session ready.` };
      if (text.startsWith("/save")) return { narration: "Acknowledged. Meta options unlocked." };
      if (text.toLowerCase().match(/search|investigate/))
        return {
          narration: "Shadows hide secrets among the clutter.",
          suggestedCheck: { ability: "Perception", dc: 12, reason: "scouring the area" },
        };
      return { narration: "The world listens closely to your intent." };
    }
    case "SYSTEM.SUGGEST_CHECK":
      return { narration: event.narration };
    case "SYSTEM.START_COMBAT":
      return { narration: event.narration ?? "Danger erupts; blades are drawn." };
    case "SYSTEM.END_COMBAT":
      return { narration: event.narration ?? "The clash fades and quiet returns." };
    case "DICE.ROLL_RESULT":
      if (context.pendingCheck) {
        const success = event.roll >= context.pendingCheck.dc;
        return { narration: success ? "Success! Fortune favors you." : "Failure. Trouble brews." };
      }
      break;
  }
  return { narration: "The narrative holds steady." };
};

const createSeededRandom = (seed = 1) => {
  let value = seed % 2147483647 || 1;
  return () => ((value = (value * 16807) % 2147483647) - 1) / 2147483646;
};

export const createFormulaRng = (seed = 1) => {
  const sample = createSeededRandom(seed);
  return (formula: string) => {
    const match = /^(\d+)d(\d+)([+-]\d+)?$/i.exec(formula.trim());
    if (!match) throw new Error(`Unsupported dice formula: ${formula}`);
    const count = Number(match[1]);
    const sides = Number(match[2]);
    const modifier = match[3] ? Number(match[3]) : 0;
    let total = 0;
    for (let i = 0; i < count; i += 1) total += 1 + Math.floor(sample() * sides);
    return total + modifier;
  };
};

export const createInitialContext = (sessionId: string, seed = 1): DMContext => ({
  sessionId,
  world: { location: "Tavern of Beginnings", flags: {} },
  rng: createFormulaRng(seed),
  log: [],
});

const rememberState = assign<DMContext, DMEvent>((ctx, _evt, meta) => ({
  world: { ...ctx.world, flags: { ...ctx.world.flags, [returnFlag]: meta.state.value } },
  log: pushLog(ctx.log, "Entering meta control."),
}));

const clearReturn = assign<DMContext, DMEvent>((ctx) => {
  const { [returnFlag]: _, ...rest } = ctx.world.flags;
  return { world: { ...ctx.world, flags: rest }, log: pushLog(ctx.log, "Resuming play.") };
});

const applySetup = assign<DMContext, DMEvent>((ctx, evt) => {
  if (evt.type !== "USER.MESSAGE") return {};
  const player: Player = {
    name: evt.input.trim() || "Wanderer",
    abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  };
  const story = narrate("SESSION_SETUP", { ...ctx, player }, evt);
  return { player, log: pushLog(ctx.log, `Player ready: ${player.name}.`, story.narration) };
});

const logExploration = assign<DMContext, DMEvent>((ctx, evt) => {
  if (evt.type !== "USER.MESSAGE") return {};
  const story = narrate("EXPLORATION", ctx, evt);
  const updates: Partial<DMContext> = { log: pushLog(ctx.log, story.narration) };
  if (story.suggestedCheck) updates.pendingCheck = story.suggestedCheck;
  if (evt.input.startsWith("/save")) return { ...updates, log: pushLog(updates.log ?? ctx.log, "Use SYSTEM.SAVE to persist.") };
  return updates;
});

const acceptCheck = assign<DMContext, SystemSuggestCheckEvent>((ctx, evt) => ({
  pendingCheck: evt.check,
  log: pushLog(ctx.log, narrate("CHECK", ctx, evt).narration),
}));

const resolveCheck = assign<DMContext, DiceRollResultEvent>((ctx, evt) => {
  if (!ctx.pendingCheck) return {};
  const story = narrate("CHECK", ctx, evt);
  return { log: pushLog(ctx.log, `Roll ${evt.roll} (${evt.formula}) vs DC ${ctx.pendingCheck.dc}.`, story.narration) };
});

const enterCombat = assign<DMContext, DMEvent>((ctx, evt) => {
  const source = evt.type === "SYSTEM.START_COMBAT" ? evt : undefined;
  const enemies = source?.enemies ?? ["Unknown foe"];
  return { combat: { enemies }, log: pushLog(ctx.log, narrate("COMBAT", ctx, evt).narration) };
});

const endCombat = assign<DMContext, SystemEndCombatEvent>((ctx, evt) => ({
  combat: undefined,
  log: pushLog(ctx.log, narrate("COMBAT", ctx, evt).narration),
}));

const clearCheck = assign<DMContext, DMEvent>(() => ({ pendingCheck: undefined }));
const returning = (state: DMStateValue) => (ctx: DMContext) => ctx.world.flags[returnFlag] === state;

export const dmMachine = createMachine({
  id: "dmMachine",
  initial: "SESSION_SETUP" as DMStateValue,
  predictableActionArguments: true,
  context: createInitialContext("uninitialized"),
  states: {
    SESSION_SETUP: {
      on: { "USER.MESSAGE": { target: "EXPLORATION", actions: applySetup } },
    },
    EXPLORATION: {
      on: {
        "USER.MESSAGE": { actions: logExploration },
        "SYSTEM.SUGGEST_CHECK": { target: "CHECK", actions: acceptCheck },
        "SYSTEM.START_COMBAT": { target: "COMBAT", actions: enterCombat },
        "SYSTEM.SAVE": { target: "META", actions: rememberState },
        "SYSTEM.LOAD": { target: "META", actions: rememberState },
      },
    },
    CHECK: {
      on: {
        "DICE.ROLL_RESULT": [
          {
            target: "COMBAT",
            cond: (ctx, evt) => ctx.pendingCheck !== undefined && evt.roll < ctx.pendingCheck.dc,
            actions: [resolveCheck, enterCombat],
          },
          { target: "EXPLORATION", actions: resolveCheck },
        ],
        "SYSTEM.START_COMBAT": { target: "COMBAT", actions: enterCombat },
      },
      exit: clearCheck,
    },
    COMBAT: {
      on: {
        "SYSTEM.END_COMBAT": { target: "EXPLORATION", actions: endCombat },
        "SYSTEM.SAVE": { target: "META", actions: rememberState },
        "SYSTEM.LOAD": { target: "META", actions: rememberState },
      },
    },
    META: {
      on: {
        "SYSTEM.SAVE": { actions: assign((ctx) => ({ log: pushLog(ctx.log, "Progress saved (mock).") })) },
        "SYSTEM.LOAD": [
          { target: "COMBAT", cond: returning("COMBAT"), actions: clearReturn },
          { target: "CHECK", cond: returning("CHECK"), actions: clearReturn },
          { target: "EXPLORATION", actions: clearReturn },
        ],
        "USER.MESSAGE": [
          { target: "COMBAT", cond: returning("COMBAT"), actions: clearReturn },
          { target: "CHECK", cond: returning("CHECK"), actions: clearReturn },
          { target: "EXPLORATION", actions: clearReturn },
        ],
      },
    },
  },
});

export const demoFlow = () => {
  const service = interpret(dmMachine.withContext(createInitialContext("demo", 7)));
  service.start();
  service.send({ type: "USER.MESSAGE", input: "Eira" });
  service.send({ type: "USER.MESSAGE", input: "I search the study" });
  service.send({
    type: "SYSTEM.SUGGEST_CHECK",
    check: { ability: "Perception", dc: 12, reason: "scouring the area" },
    narration: "Senses sharpen; a roll feels appropriate.",
  });
  const roll = service.state.context.rng("1d20+3");
  service.send({ type: "DICE.ROLL_RESULT", roll, formula: "1d20+3" });
  const log = service.state.context.log.slice();
  service.stop();
  return log;
};
