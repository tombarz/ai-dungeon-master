export type Author = 'user' | 'assistant'

export interface Message {
  id: number
  author: Author
  content: string
  timestamp: string
}

const INTRO_COPY = "Hey adventurer! Ready to craft your next quest? Drop me a line and we'll conjure something epic."

export const AUTO_REPLIES = [
  'Noted! I will weave that into the adventure. Want an unexpected ally or a hidden threat next?',
  'Got it. I can foreshadow a twist or drop lore breadcrumbs-what vibe are you leaning toward?',
  'Interesting direction! Should we raise the stakes or give the party a breather scene?',
  'Perfect. I can introduce a rival faction or a mystical artifact to escalate the drama.',
  'Let\'s make it memorable. Do you want the next beat to be tactical, emotional, or mysterious?',
] as const

export function createInitialMessages(dateFactory: () => Date = () => new Date()): Message[] {
  return [
    {
      id: 1,
      author: 'assistant',
      content: INTRO_COPY,
      timestamp: formatTimestamp(dateFactory()),
    },
  ]
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function pickAutoReply(prompt: string): string {
  const index = Math.abs(hashPrompt(prompt)) % AUTO_REPLIES.length
  return AUTO_REPLIES[index]
}

export function hashPrompt(text: string): number {
  let acc = 0
  for (let i = 0; i < text.length; i += 1) {
    acc = (acc << 5) - acc + text.charCodeAt(i)
    acc |= 0
  }
  return acc
}