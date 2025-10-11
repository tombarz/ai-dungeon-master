"use client";

import { OllamaChat } from "@ai-dungeon-master/ui";

const resolveSystemPrompt = () => {
  if (typeof process !== "undefined") {
    return process.env?.NEXT_PUBLIC_DM_SYSTEM_PROMPT ?? process.env?.NEXT_PUBLIC_OLLAMA_SYSTEM_PROMPT;
  }
  return undefined;
};

const resolveApiBaseUrl = () => {
  if (typeof process !== "undefined") {
    return process.env?.NEXT_PUBLIC_API_BASE_URL;
  }
  return undefined;
};

export default function Home() {
  const systemPrompt = resolveSystemPrompt();
  const apiBaseUrl = resolveApiBaseUrl();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <main className="mx-auto w-full max-w-3xl">
        <OllamaChat
          placeholder="Describe your next move or ask for a plot twist..."
          apiBaseUrl={apiBaseUrl}
          systemPrompt={systemPrompt}
          useStateMachine
        />
      </main>
    </div>
  );
}
