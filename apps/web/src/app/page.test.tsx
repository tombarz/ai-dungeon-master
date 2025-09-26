import React from "react"
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import Home from "./page"

describe("Home chat interface", () => {
  it("keeps the send button disabled until text is entered", async () => {
    render(<Home />)

    const textarea = screen.getByLabelText("Message")
    const sendButton = screen.getByRole("button", { name: /send/i })
    const user = userEvent.setup()

    expect(sendButton).toBeDisabled()

    await user.type(textarea, "Let us parley with the oracle")

    expect(sendButton).toBeEnabled()
  })

  it("appends the submitted message, clears the textarea, and disables the button again", async () => {
    render(<Home />)

    const textarea = screen.getByLabelText("Message")
    const sendButton = screen.getByRole("button", { name: /send/i })
    const user = userEvent.setup()

    await user.type(textarea, "Chart a path through the shadowfen")
    await user.click(sendButton)

    expect(textarea).toHaveValue("")
    expect(sendButton).toBeDisabled()
    expect(screen.getByText("Chart a path through the shadowfen")).toBeInTheDocument()
  })
})