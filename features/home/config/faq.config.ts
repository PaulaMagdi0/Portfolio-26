import type { FaqItem } from '../types';

// Entity-anchored Q&A about Paula. Rendered as a visible accordion AND emitted as
// FAQPage JSON-LD by the FAQ component (schema and content stay in lock-step).
// Questions are phrased as real queries an AI answer engine would receive.
export const FAQ_ITEMS: readonly FaqItem[] = [
  { id: 'who', questionKey: 'home.faq.q1', answerKey: 'home.faq.a1' },
  { id: 'stack', questionKey: 'home.faq.q2', answerKey: 'home.faq.a2' },
  { id: 'work', questionKey: 'home.faq.q3', answerKey: 'home.faq.a3' },
  { id: 'location', questionKey: 'home.faq.q4', answerKey: 'home.faq.a4' },
  { id: 'credentials', questionKey: 'home.faq.q5', answerKey: 'home.faq.a5' },
  { id: 'contact', questionKey: 'home.faq.q6', answerKey: 'home.faq.a6' },
] as const satisfies readonly FaqItem[];
