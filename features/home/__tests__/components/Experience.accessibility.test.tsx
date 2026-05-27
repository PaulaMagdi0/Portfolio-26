import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Experience } from '@/features/home/components/Experience';

describe('Experience accessibility', () => {
  it('has no a11y violations', async () => {
    const ui = await Experience();
    const { container } = render(<>{ui}</>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
