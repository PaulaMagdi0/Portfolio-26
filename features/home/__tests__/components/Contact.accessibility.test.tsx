import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Contact } from '@/features/home/components/Contact';

describe('Contact accessibility', () => {
  it('has no a11y violations', async () => {
    const ui = await Contact();
    const { container } = render(<>{ui}</>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
