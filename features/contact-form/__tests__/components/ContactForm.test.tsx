import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/features/contact-form';

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/formName/i), 'Jane Doe');
  await user.type(screen.getByLabelText(/formEmail/i), 'jane@example.com');
  await user.type(screen.getByLabelText(/formMessage/i), 'Hello there ten plus chars');
}

describe('ContactForm', () => {
  it('shows success banner and resets fields on successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ContactForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /formSend/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByLabelText(/formName/i)).toHaveValue('');
    expect(screen.getByLabelText(/formEmail/i)).toHaveValue('');
    expect(screen.getByLabelText(/formMessage/i)).toHaveValue('');
  });

  it('shows error banner and preserves fields on submission failure', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network'));
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ContactForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /formSend/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/formName/i)).toHaveValue('Jane Doe');
    expect(screen.getByLabelText(/formEmail/i)).toHaveValue('jane@example.com');
    consoleSpy.mockRestore();
  });

  it('blocks submission when fields are invalid', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ContactForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /formSend/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders the honeypot field hidden from users and assistive tech', () => {
    const { container } = render(<ContactForm onSubmit={vi.fn()} />);
    const honeypot = container.querySelector('input[name="botcheck"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute('aria-hidden', 'true');
    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveClass('hidden');
  });

  it('disables the submit button while sending', async () => {
    let resolveSubmit!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<ContactForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /formSend/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /formSending/i })).toBeDisabled();
    });

    resolveSubmit();
  });

  it('clears the error banner when the user starts typing again', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network'));
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ContactForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /formSend/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    await user.type(screen.getByLabelText(/formName/i), 'x');

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });
});
