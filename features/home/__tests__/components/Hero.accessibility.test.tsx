import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

vi.mock('@/features/home/components/Hero3DLazy', () => ({
  Hero3DLazy: () => null,
}));

import { Hero } from '@/features/home/components/Hero';

describe('Hero accessibility', () => {
  it('has no a11y violations', async () => {
    const ui = await Hero();
    const { container } = render(<>{ui}</>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
