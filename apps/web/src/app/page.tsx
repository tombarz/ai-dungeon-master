'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'

import { Message, createMessage } from '../lib/chat'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const viewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!viewportRef.current) return
    viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = draft.trim()

    if (!trimmed) return

    const userMessage = createMessage('user', trimmed)

    setMessages((current) => [...current, userMessage])
    setDraft('')
  }

  const disableSend = draft.trim().length === 0

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-14">
        <div className="flex flex-1 flex-col rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <header className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">AI Dungeon Master</h1>
              <p className="mt-1 text-sm text-slate-300">
                Craft immersive stories, brainstorm encounters, and keep the narrative flowing.
              </p>
            </div>
            <div className="hidden shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 sm:inline-flex">
              Live Prototype
            </div>
          </header>

          <div className="mb-6 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
            <div
              ref={viewportRef}
              className="flex h-full flex-col gap-4 overflow-y-auto p-6"
            >
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="sr-only" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask for a plot twist, a new NPC, or a looming challenge..."
                className="min-h-[80px] flex-1 resize-none rounded-2xl border border-white/20 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
              />
              <button
                type="submit"
                disabled={disableSend}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:shadow-none"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.author === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-3xl px-5 py-4 text-sm shadow-lg transition ${
          isUser
            ? 'rounded-br-md bg-gradient-to-br from-sky-500 to-sky-400 text-white'
            : 'rounded-bl-md border border-white/10 bg-white/5 text-slate-100'
        }`}
      >
        <span className="block whitespace-pre-wrap leading-relaxed">{message.content}</span>
        <span className="mt-2 block text-[10px] uppercase tracking-[0.2em] text-white/60">
          {message.timestamp}
        </span>
      </div>
    </div>
  )
}