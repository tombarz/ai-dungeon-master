import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Home from "./page";

type FetchMock = ReturnType<typeof createFetchMock>;

const createFetchMock = () =>
  vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    // State machine endpoint for both bootstrap and steps
    if (url.includes("http://localhost:3001/api/state-machine/step")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          sessionId: "test-session",
          phase: "CHARACTER_CREATION",
          output: "What's the character's name?",
        }),
        text: async () => "",
      } as Response;
    }
    throw new Error(`Unexpected fetch URL: ${url}`);
  });

let fetchMock: FetchMock;
let originalFetch: typeof globalThis.fetch | undefined;

describe("Home", () => {
  beforeEach(() => {
    fetchMock = createFetchMock();
    originalFetch = globalThis.fetch;
    (globalThis as { fetch?: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
    vi.restoreAllMocks();
  });

  it("renders only the chat interface", () => {
    render(<Home />);
    expect(screen.getByPlaceholderText(/describe your next move/i)).toBeInTheDocument();
    expect(screen.queryByText(/Quick setup/i)).not.toBeInTheDocument();
  });

  it("keeps the send button disabled until text is entered", async () => {
    render(<Home />);

    const textarea = screen.getByPlaceholderText(/describe your next move/i);
    const sendButton = screen.getByRole("button", { name: /send/i });
    const user = userEvent.setup();

    expect(sendButton).toBeDisabled();

    await user.type(textarea, "Scout the crystal caverns");

    expect(sendButton).toBeEnabled();
  });

  it("submits the user message and renders the assistant reply", async () => {
    render(<Home />);

    const textarea = screen.getByPlaceholderText(/describe your next move/i);
    const sendButton = screen.getByRole("button", { name: /send/i });
    const user = userEvent.setup();

    await user.type(textarea, "Chart a course through the astral seas");
    await user.click(sendButton);

    expect(textarea).toHaveValue("");
    await waitFor(() => expect(screen.getByText(/what's the character's name\?/i)).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalled();
  });
});
