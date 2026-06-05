'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal } from '@/features/ui-components';
import { cn } from '@/lib/utils';

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

// Matches the site's signature easing (used by the case-study drawer / reveals).
const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * Animated FAQ accordion. The answer text is ALWAYS rendered (height + offset are
 * animated, it is never conditionally unmounted) so it stays in the static HTML
 * for crawlers/GEO — only its height/opacity/offset animate. One panel open at a
 * time. On open: the panel expands and the answer text rises and fades in just
 * behind it; the question shifts and tints amber and the +/× marker rotates.
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
            delay={i * 0.06}
            className="border-line border-t first:border-t-0"
          >
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="group flex w-full cursor-pointer items-center justify-between gap-4 py-6 text-start md:py-7"
              >
                <motion.span
                  animate={{ x: isOpen ? 8 : 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={cn(
                    'font-serif text-[20px] leading-[1.25] transition-colors duration-300 md:text-[24px]',
                    isOpen ? 'text-amber' : 'text-ink group-hover:text-amber/90',
                  )}
                >
                  {item.question}
                </motion.span>
                <motion.span
                  aria-hidden
                  animate={{ rotate: isOpen ? 135 : 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
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
              initial={{ height: 0 }}
              animate={{ height: isOpen ? 'auto' : 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 14 }}
                transition={{ duration: 0.45, ease: EASE, delay: isOpen ? 0.12 : 0 }}
                className="text-inkdim max-w-[680px] pb-6 text-[14px] leading-relaxed md:text-[15px]"
              >
                {item.answer}
              </motion.p>
            </motion.div>
          </Reveal>
        );
      })}
    </div>
  );
}
