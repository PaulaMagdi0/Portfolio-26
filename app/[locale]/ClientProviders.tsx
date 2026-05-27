'use client';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { MotionProvider } from '@/core/motion';
import { TIME_ZONE } from '@/i18n/config';
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
      <NextIntlClientProvider locale={locale} messages={messages} timeZone={TIME_ZONE}>
        <MotionProvider>{children}</MotionProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
