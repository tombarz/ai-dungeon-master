import React, { useMemo, useState } from "react";

import type { ChatMessage } from "../chat/types";

export interface OllamaChatProps {
  initialMessages?: ChatMessage[];
  placeholder?: string;
  apiBaseUrl?: string;
  systemPrompt?: string;
  useStateMachine?: boolean;
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "100%",
  maxWidth: 640,
};

const transcriptStyle: React.CSSProperties = {
  minHeight: 240,
  padding: "1rem",
  border: "1px solid #1f2937",
  borderRadius: "12px",
  backgroundColor: "#0f172a",
  color: "#e2e8f0",
};

const errorStyle: React.CSSProperties = {
  color: "#ef4444",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "flex-start",
};

const textAreaStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 120,
  padding: "0.85rem 1rem",
  borderRadius: "10px",
  border: "1px solid #334155",
  backgroundColor: "#0b1120",
  color: "#f8fafc",
  resize: "vertical",
  fontSize: "0.95rem",
  lineHeight: 1.5,
};

const buttonStyle: React.CSSProperties = {
  padding: "0.85rem 1.4rem",
  borderRadius: "10px",
  border: 0,
  background: "linear-gradient(135deg, #38bdf8, #3b82f6)",
  color: "#0b1120",
  fontWeight: 600,
  cursor: "pointer",
};

const trimTrailingSlash = (url: string) => url.replace(/\/$/, "");

const getApiBaseUrl = (override?: string): string => {
  if (override) return trimTrailingSlash(override);
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL);
  }
  return "http://localhost:3001";
};

async function sendChatToApi(
  messages: ChatMessage[],
  options: { apiBaseUrl?: string; systemPrompt?: string },
): Promise<string> {
  const baseUrl = getApiBaseUrl(options.apiBaseUrl);
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, systemPrompt: options.systemPrompt }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`API request failed (${response.status}): ${details}`.trim());
  }

  const data = (await response.json()) as { content?: string };
  return data?.content ?? "";
}

type StateMachineResponse = {
  sessionId: string;
  phase: 'CHARACTER_CREATION' | 'EXPLORING';
  output: string;
  draft?: unknown;
  pendingField?: string;
};

const SESSION_STORAGE_KEY = 'adm.sessionId';

const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing && existing.length > 0) return existing;
  const fresh = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, fresh);
  return fresh;
};

async function stepStateMachine(
  message: string,
  options: { apiBaseUrl?: string },
): Promise<StateMachineResponse> {
  const baseUrl = getApiBaseUrl(options.apiBaseUrl);
  const sessionId = getOrCreateSessionId();
  const response = await fetch(`${baseUrl}/api/state-machine/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`API request failed (${response.status}): ${details}`.trim());
  }
  return (await response.json()) as StateMachineResponse;
}

export const OllamaChat: React.FC<OllamaChatProps> = ({
  initialMessages = [],
  placeholder = "Share your next move...",
  apiBaseUrl,
  systemPrompt,
  useStateMachine = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Static intro when using the state machine (no network call)
  React.useEffect(() => {
    if (!useStateMachine) return;
    if (messages.length > 0) return;
    const intro =
      "Before we start the campaign, let's create your legendary character. I'll ask a few quick questions and we’ll build it together.";
    setMessages([{ role: 'assistant', content: intro }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useStateMachine]);

  const transcript = useMemo(
    () =>
      messages.map((msg, index) => (
        <div key={`${msg.role}-${index}`} style={{ marginBottom: "0.75rem" }}>
          <strong>{msg.role === "user" ? "You" : msg.role === "assistant" ? "DM" : "System"}</strong>
          <div>{msg.content}</div>
        </div>
      )),
    [messages],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || pending) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const history = messages.concat(userMessage);
    setMessages(history);
    setInput("");
    setPending(true);
    setError(null);

    try {
      if (useStateMachine) {
        const res = await stepStateMachine(userMessage.content, { apiBaseUrl });
        const reply = res.output ?? '';
        if (reply.trim().length > 0) {
          setMessages((current) => current.concat({ role: 'assistant', content: reply.trim() }));
        }
      } else {
        const reply = await sendChatToApi(history, { apiBaseUrl, systemPrompt });
        if (reply.trim().length > 0) {
          setMessages((current) => current.concat({ role: "assistant", content: reply.trim() }));
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setMessages((current) => current.concat({
        role: "assistant",
        content: "I ran into an issue contacting the storyteller. Please try again.",
      }));
    } finally {
      setPending(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget as unknown as { value?: string };
    setInput(target.value ?? "");
  };

  return (
    <div style={containerStyle}>
      <div style={transcriptStyle}>
        {transcript.length > 0 ? transcript : <div style={{ color: "#94a3b8" }}>Awaiting your first command...</div>}
      </div>
      {error ? <div style={errorStyle}>{error}</div> : null}
      <form onSubmit={handleSubmit} style={formStyle}>
        <textarea
          value={input}
          onChange={handleChange}
          placeholder={placeholder}
          style={textAreaStyle}
        />
        <button
          type="submit"
          disabled={pending || input.trim().length === 0}
          style={{
            ...buttonStyle,
            opacity: pending || input.trim().length === 0 ? 0.6 : 1,
            cursor: pending || input.trim().length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {pending ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
};
