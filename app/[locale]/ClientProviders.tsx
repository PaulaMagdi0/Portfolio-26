'use client';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { MotionProvider } from '@/core/motion';
import type { ReactNode } from 'react';
import type { AbstractIntlMessages } from 'next-intl';

interface ClientProvidersProps {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}

export function ClientProviders({ locale, messages, children }: ClientProvidersProps) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <MotionProvider>{children}</MotionProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
