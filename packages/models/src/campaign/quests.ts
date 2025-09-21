// Quest management and flags

export interface QuestFlag {
  id: string;
  name: string;
  type: "boolean" | "number" | "string" | "object";
  value: boolean | number | string | Record<string, unknown>;
  description?: string;
  timestamp: Date;
}

export interface CanonFact {
  id: string;
  title: string;
  content: string;
  category: "history" | "geography" | "culture" | "religion" | "politics" | "magic" | "other";
  importance: "minor" | "major" | "critical";
  verified: boolean;
  source?: string;
  relatedFacts?: string[]; // IDs of related facts
  timestamp: Date;
}
