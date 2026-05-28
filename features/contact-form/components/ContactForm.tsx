'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Magnetic } from '@/features/ui-components';
import { Field } from './Field';
import { buildContactSchema, type ContactFormValues } from '../types/contact.schema';
import { submitContact as defaultSubmit } from '../services/submitContact';

type Status = 'idle' | 'sending' | 'sent' | 'error';

interface ContactFormProps {
  onSubmit?: typeof defaultSubmit;
}

export function ContactForm({ onSubmit = defaultSubmit }: ContactFormProps = {}) {
  const t = useTranslations('contact');
  const tUi = useTranslations('ui');
  const schema = buildContactSchema(t);
  const [status, setStatus] = useState<Status>('idle');
  const bannerRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(schema) });

  const handleFieldChange = () => {
    if (status === 'error') setStatus('idle');
  };

  useEffect(() => {
    if ((status === 'sent' || status === 'error') && bannerRef.current) {
      bannerRef.current.focus();
    }
  }, [status]);

  const handleFormSubmit = async (values: ContactFormValues) => {
    setStatus('sending');
    try {
      await onSubmit(values);
      reset();
      setStatus('sent');
    } catch (err) {
      console.error('[ContactForm] submission failed', err);
      setStatus('error');
    }
  };

  const submitLabel = status === 'sending' ? t('formSending') : t('formSend');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} onChange={handleFieldChange} noValidate>
      {status === 'sent' && (
        <div
          ref={bannerRef}
          role="status"
          tabIndex={-1}
          aria-live="polite"
          className="mb-6 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          {t('formSuccess')}
        </div>
      )}
      {status === 'error' && (
        <div
          ref={bannerRef}
          role="alert"
          tabIndex={-1}
          aria-live="assertive"
          className="mb-6 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
        >
          {t('formError')}
        </div>
      )}
      <input
        type="text"
        {...register('botcheck')}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
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
            disabled={status === 'sending'}
            data-cursor-label={tUi('cursor.send')}
            className="btn-base btn-primary disabled:opacity-60"
          >
            {submitLabel}
            {status === 'sending' ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.25"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
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
            )}
          </button>
        </Magnetic>
        <span className="text-inkmute font-mono text-[12px]">{t('formHelper')}</span>
      </div>
      <p className="text-inkmute mt-3 font-mono text-[11px]">{t('formPrivacy')}</p>
    </form>
  );
}
