'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Magnetic } from '@/features/ui-components';
import { Field } from './Field';
import { buildContactSchema, type ContactFormValues } from '../types/contact.schema';
import { buildMailto } from '../utils/buildMailto';

type Status = 'idle' | 'sending' | 'sent';

export function ContactForm() {
  const t = useTranslations('contact');
  const tUi = useTranslations('ui');
  const schema = buildContactSchema(t);
  const [status, setStatus] = useState<Status>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: ContactFormValues) => {
    setStatus('sending');
    const url = buildMailto(values);
    requestAnimationFrame(() => {
      window.location.href = url;
      setTimeout(() => setStatus('sent'), 200);
    });
  };

  const submitLabel =
    status === 'sending' ? t('formSending') : status === 'sent' ? t('formSent') : t('formSend');

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Field
        id="name"
        label={t('formName')}
        placeholder={t('formNamePlaceholder')}
        autoComplete="name"
        {...register('name')}
        error={errors.name?.message}
      />
      <Field
        id="email"
        type="email"
        label={t('formEmail')}
        placeholder={t('formEmailPlaceholder')}
        autoComplete="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Field
        id="message"
        textarea
        label={t('formMessage')}
        placeholder={t('formMessagePlaceholder')}
        {...register('message')}
        error={errors.message?.message}
      />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Magnetic as="span" strength={0.25}>
          <button
            type="submit"
            disabled={status !== 'idle'}
            data-cursor-label={tUi('cursor.send')}
            className="btn-base btn-primary disabled:opacity-60"
          >
            {submitLabel}
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </button>
        </Magnetic>
        <span className="text-inkmute font-mono text-[12px]">{t('formHelper')}</span>
      </div>
    </form>
  );
}
