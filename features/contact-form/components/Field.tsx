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
  const labelClass = 'block font-mono text-[10px] tracking-[0.18em] text-inkmute uppercase mb-2';
  const inputClass =
    'block w-full bg-bg2 border border-line rounded-md px-4 py-3 text-[15px] text-ink placeholder:text-inkmute focus:border-amber focus:outline-none transition-colors';

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={5}
          className={inputClass}
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
      {error ? (
        <p id={`${id}-error`} className="text-amber mt-1.5 font-mono text-[11px]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
