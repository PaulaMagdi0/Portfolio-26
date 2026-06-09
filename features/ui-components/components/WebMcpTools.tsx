'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { isLocale } from '@/i18n/config';
// Direct imports (not the @/features/home barrel) keep this client bundle free of
// the home React components the barrel re-exports — the home route has a strict JS budget.
import { buildHomeMarkdown } from '@/features/home/utils/buildHomeMarkdown';
import { RECIPIENT_EMAIL } from '@/features/home/config/socials.config';

// WebMCP (navigator.modelContext) exposes the portfolio's real, in-page actions to
// browser AI agents. Experimental API (Chrome EPP) — feature-detected, so it is a
// no-op in every browser that doesn't implement it. See:
// https://webmachinelearning.github.io/webmcp/

interface McpToolResult {
  content: { type: 'text'; text: string }[];
}

interface McpToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<McpToolResult> | McpToolResult;
}

interface ModelContext {
  provideContext: (context: { tools: McpToolDescriptor[] }) => void;
}

const SECTIONS = [
  'work',
  'experience',
  'education',
  'certifications',
  'stack',
  'faq',
  'contact',
] as const;

function asResult(message: string): McpToolResult {
  return { content: [{ type: 'text', text: message }] };
}

function scrollToId(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

export function WebMcpTools() {
  const activeLocale = useLocale();

  useEffect(() => {
    const nav = navigator as Navigator & { modelContext?: ModelContext };
    if (!nav.modelContext || typeof nav.modelContext.provideContext !== 'function') return;

    const locale = isLocale(activeLocale) ? activeLocale : 'en';

    const tools: McpToolDescriptor[] = [
      {
        name: 'get_portfolio',
        description:
          "Get Paula Magdy's full portfolio as Markdown — profile, selected work/projects, experience, education, certifications, tech stack, and contact details.",
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: () => asResult(buildHomeMarkdown(locale)),
      },
      {
        name: 'view_projects',
        description:
          "Scroll the page to Paula Magdy's selected work/projects section. Use get_portfolio for the full project details.",
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: () =>
          asResult(
            scrollToId('work')
              ? 'Scrolled to the selected work section. Call get_portfolio for full project details, stacks, and links.'
              : 'Could not locate the work section on this page.',
          ),
      },
      {
        name: 'download_resume',
        description: "Open Paula Magdy's resume (PDF) in a new browser tab.",
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: () => {
          window.open('/resume.pdf', '_blank', 'noopener,noreferrer');
          return asResult('Opened the resume PDF at /resume.pdf.');
        },
      },
      {
        name: 'contact_me',
        description:
          'Scroll to the contact section and return how to reach Paula Magdy (email + on-page contact form).',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: () => {
          scrollToId('contact');
          return asResult(
            `Scrolled to the contact section. Email: ${RECIPIENT_EMAIL}. A contact form is also available on the page; replies typically within 24 hours.`,
          );
        },
      },
      {
        name: 'navigate_to_section',
        description: `Scroll the page to a named section of the portfolio. One of: ${SECTIONS.join(', ')}.`,
        inputSchema: {
          type: 'object',
          properties: { section: { type: 'string', enum: [...SECTIONS] } },
          required: ['section'],
          additionalProperties: false,
        },
        execute: (args) => {
          const section = String(args.section ?? '');
          if (!SECTIONS.includes(section as (typeof SECTIONS)[number])) {
            return asResult(
              `Unknown section "${section}". Valid sections: ${SECTIONS.join(', ')}.`,
            );
          }
          return asResult(
            scrollToId(section)
              ? `Scrolled to the ${section} section.`
              : `Could not find the ${section} section.`,
          );
        },
      },
    ];

    nav.modelContext.provideContext({ tools });
  }, [activeLocale]);

  return null;
}
