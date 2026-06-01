import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { TopNav } from '@/features/ui-components';

// The "closed" case is the one that catches the aria-hidden-focus bug: it only
// passes if the closed overlay leaves the a11y tree (via `inert`), so the
// focusable links inside it are not flagged. Do not add an axe-rule suppression.

describe('TopNav accessibility', () => {
  it('has no axe violations when closed', async () => {
    const { container } = render(<TopNav />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations with the mobile dialog open', async () => {
    const user = userEvent.setup();
    const { container } = render(<TopNav />);
    await user.click(screen.getByRole('button', { name: /ui\.nav\.openMenu/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
