'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal } from '@/features/ui-components';

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

/**
 * Animated FAQ accordion. The answer text is ALWAYS rendered (height-animated,
 * not conditionally mounted) so it stays in the static HTML for crawlers/GEO —
 * only its height/opacity animate on open/close. One panel open at a time.
 */
export function FaqAccordion({ items }: { items: readonly FaqEntry[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openId === item.id;
        return (
          <Reveal
            key={item.id}
            as="div"
            delay={i * 0.05}
            className="border-line border-t first:border-t-0"
          >
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="hover:text-amber/90 flex w-full cursor-pointer items-center justify-between gap-4 py-6 text-start transition-colors md:py-7"
              >
                <span className="text-ink font-serif text-[20px] leading-[1.25] md:text-[24px]">
                  {item.question}
                </span>
                <motion.span
                  aria-hidden
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                  className="text-amber shrink-0"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </motion.span>
              </button>
            </h3>
            <motion.div
              id={`faq-answer-${item.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
              className="overflow-hidden"
            >
              <p className="text-inkdim max-w-[680px] pb-6 text-[14px] leading-relaxed md:text-[15px]">
                {item.answer}
              </p>
            </motion.div>
          </Reveal>
        );
      })}
    </div>
  );
}
