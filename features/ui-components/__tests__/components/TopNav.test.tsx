import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopNav } from '@/features/ui-components';

// No matchMedia mock needed — TopNav never calls window.matchMedia. The
// hamburger's `md:hidden` Tailwind class has no effect in jsdom (no CSS engine),
// so the button is always in the DOM and findable by role. The next-intl mock
// in vitest.setup.ts makes t('openMenu') return the key string "ui.nav.openMenu".

afterEach(() => {
  document.body.style.overflow = '';
});

function getHamburger() {
  return screen.getByRole('button', { name: /ui\.nav\.openMenu|Open menu/i });
}

describe('TopNav mobile menu', () => {
  it('opens and closes the dialog on hamburger toggle', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    const trigger = getHamburger();

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const dialog = screen.getByRole('dialog', { hidden: false });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and restores body scroll', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    await user.click(getHamburger());
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(getHamburger()).toHaveAttribute('aria-expanded', 'false');
    expect(document.body.style.overflow).toBe('');
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    const trigger = getHamburger();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true'); // guard against a vacuous pass
    const dialog = screen.getByRole('dialog');
    await user.click(dialog);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('locks body scroll while open and unlocks on close', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    const trigger = getHamburger();
    expect(document.body.style.overflow).toBe('');
    await user.click(trigger);
    expect(document.body.style.overflow).toBe('hidden');
    // The trigger's accessible name flips to "close" while open, so re-querying
    // by the open-label would miss it — toggle the same element instead.
    await user.click(trigger);
    expect(document.body.style.overflow).toBe('');
  });

  it('focuses the first focusable element inside the dialog on open', async () => {
    const user = userEvent.setup();
    render(<TopNav />);
    await user.click(getHamburger());
    const dialog = screen.getByRole('dialog');
    const closeBtn = within(dialog).getByRole('button', {
      name: /ui\.nav\.closeMenu|Close menu/i,
    });
    expect(document.activeElement).toBe(closeBtn);
  });
});
