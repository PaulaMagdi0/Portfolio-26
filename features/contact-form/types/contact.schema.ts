import { z } from 'zod';

type Translator = (key: string) => string;

export function buildContactSchema(t: Translator) {
  return z.object({
    name: z.string().min(1, t('errors.nameRequired')).max(80, t('errors.nameMax')),
    email: z.string().email(t('errors.emailInvalid')),
    message: z.string().min(10, t('errors.messageMin')).max(2000, t('errors.messageMax')),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>;
