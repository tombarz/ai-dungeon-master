import { describe, expect, it } from 'vitest'

import { createMessage, formatTimestamp } from './chat'

describe('createMessage', () => {
  it('creates a message with the provided author and content', () => {
    const message = createMessage('user', 'We strike at dawn', () => new Date('2024-01-01T08:15:00Z'))

    expect(message).toEqual({
      id: new Date('2024-01-01T08:15:00Z').getTime(),
      author: 'user',
      content: 'We strike at dawn',
      timestamp: formatTimestamp(new Date('2024-01-01T08:15:00Z')),
    })
  })

  it('derives a unique id from the date factory output', () => {
    const first = createMessage('user', 'First', () => new Date(1))
    const second = createMessage('user', 'Second', () => new Date(2))

    expect(first.id).not.toBe(second.id)
  })
})

describe('formatTimestamp', () => {
  it('formats the date to the expected hh:mm output', () => {
    const formatted = formatTimestamp(new Date('2024-01-01T22:05:00Z'))

    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
  })
})