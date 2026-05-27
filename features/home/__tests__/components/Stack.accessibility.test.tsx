import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Stack } from '@/features/home/components/Stack';

describe('Stack accessibility', () => {
  it('has no a11y violations', async () => {
    const ui = await Stack();
    const { container } = render(<>{ui}</>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
