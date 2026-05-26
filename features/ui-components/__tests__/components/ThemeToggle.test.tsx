import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/features/ui-components';

function withTheme(ui: React.ReactNode) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
      {ui}
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  it('renders a button with a switch-theme label after mount', async () => {
    render(withTheme(<ThemeToggle />));
    const button = await screen.findByRole('button');
    // next-intl is mocked as `namespace.key`; accept either the real strings or the mock form
    expect(button).toHaveAccessibleName(
      /Switch to (light|dark) theme|ui\.theme\.switch(ToLight|ToDark)/,
    );
  });

  it('toggles theme on click', async () => {
    const user = userEvent.setup();
    render(withTheme(<ThemeToggle />));
    const button = await screen.findByRole('button');
    const initialLabel = button.getAttribute('aria-label');
    await user.click(button);
    // After the click, the label should change (light <-> dark)
    expect(button.getAttribute('aria-label')).not.toBe(initialLabel);
  });
});
