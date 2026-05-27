'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Field } from './Field';
import { buildContactSchema, type ContactFormValues } from '../types/contact.schema';
import { buildMailto } from '../utils/buildMailto';

type Status = 'idle' | 'sending' | 'sent';

export function ContactForm() {
  const t = useTranslations('contact');
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
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
      <button type="submit" className="btn-base btn-primary w-fit">
        {submitLabel}
      </button>
      <p className="text-inkmute font-mono text-xs">{t('formHelper')}</p>
    </form>
  );
}
