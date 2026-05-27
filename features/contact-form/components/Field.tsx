'use client';

import type { ComponentPropsWithRef } from 'react';

type BaseProps = {
  id: string;
  label: string;
  error?: string;
  textarea?: boolean;
};

type FieldProps = BaseProps &
  (
    | (Omit<ComponentPropsWithRef<'input'>, 'id'> & { textarea?: false })
    | (Omit<ComponentPropsWithRef<'textarea'>, 'id'> & { textarea: true })
  );

export function Field({ id, label, error, textarea, ...rest }: FieldProps) {
  const inputClass =
    'block w-full border-b border-line bg-transparent pb-2 pt-1 font-serif text-[20px] md:text-[24px] text-ink placeholder:text-inkmute placeholder:font-serif placeholder:font-normal focus:border-amber/70 focus:outline-none transition-colors';

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-inkmute font-mono text-[10px] tracking-[0.18em] uppercase"
        >
          {label}
        </label>
        {error ? (
          <span id={`${id}-error`} role="alert" className="text-amber font-mono text-[10px]">
            {error}
          </span>
        ) : null}
      </div>
      {textarea ? (
        <textarea
          id={id}
          rows={4}
          className={`${inputClass} resize-none`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...(rest as ComponentPropsWithRef<'textarea'>)}
        />
      ) : (
        <input
          id={id}
          className={inputClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...(rest as ComponentPropsWithRef<'input'>)}
        />
      )}
    </div>
  );
}
