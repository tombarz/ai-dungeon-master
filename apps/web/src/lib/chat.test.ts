import { describe, expect, it } from 'vitest'

import {
  AUTO_REPLIES,
  createInitialMessages,
  formatTimestamp,
  hashPrompt,
  pickAutoReply,
} from './chat'

describe('pickAutoReply', () => {
  it('returns the same reply for identical prompts', () => {
    const prompt = 'Forge a dragon encounter'
    const first = pickAutoReply(prompt)
    const second = pickAutoReply(prompt)

    expect(first).toBe(second)
  })

  it('returns replies from the predefined set', () => {
    const reply = pickAutoReply('Set the scene for a tavern brawl')

    expect(AUTO_REPLIES).toContain(reply)
  })

  it('distributes prompts across multiple replies', () => {
    const prompts = ['dragon', 'forest', 'artifact', 'intrigue', 'respite']
    const replies = new Set(prompts.map((prompt) => pickAutoReply(prompt)))

    expect(replies.size).toBeGreaterThan(1)
  })
})

describe('createInitialMessages', () => {
  it('seeds the assistant intro with a timestamp derived from the provided date', () => {
    const fixedDate = new Date('2024-01-01T15:30:00Z')
    const [message] = createInitialMessages(() => fixedDate)

    expect(message.author).toBe('assistant')
    expect(message.content).toMatch(/Ready to craft your next quest/)
    expect(message.timestamp).toBe(formatTimestamp(fixedDate))
  })
})

describe('hashPrompt', () => {
  it('creates deterministic hashes for the same input', () => {
    expect(hashPrompt('mystery box')).toBe(hashPrompt('mystery box'))
  })

  it('produces different hashes for clearly different inputs', () => {
    expect(hashPrompt('mystery box')).not.toBe(hashPrompt('ancient prophecy'))
  })
})