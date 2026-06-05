import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { FAQ } from '@/features/home/components/FAQ';

describe('FAQ accessibility', () => {
  it('has no a11y violations', async () => {
    const ui = await FAQ();
    const { container } = render(<>{ui}</>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
