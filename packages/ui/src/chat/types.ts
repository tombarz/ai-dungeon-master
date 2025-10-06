export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatSession {
  messages: ChatMessage[];
  systemPrompt?: string;
}
