export type Author = 'user' | 'assistant'

export interface Message {
  id: number
  author: Author
  content: string
  timestamp: string
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function createMessage(
  author: Author,
  content: string,
  dateFactory: () => Date = () => new Date(),
): Message {
  const date = dateFactory()
  const timestamp = formatTimestamp(date)

  return {
    id: date.getTime(),
    author,
    content,
    timestamp,
  }
}