import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ContactForm } from '@/features/contact-form';

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/formName/i), 'Jane Doe');
  await user.type(screen.getByLabelText(/formEmail/i), 'jane@example.com');
  await user.type(screen.getByLabelText(/formMessage/i), 'Hello there ten plus chars');
}

describe('ContactForm accessibility', () => {
  it('has no a11y violations in idle state', async () => {
    const { container } = render(<ContactForm onSubmit={vi.fn()} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no a11y violations after a successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { container } = render(<ContactForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /formSend/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no a11y violations after a failed submission', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network'));
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<ContactForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /formSend/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    expect(await axe(container)).toHaveNoViolations();
    consoleSpy.mockRestore();
  });
});
