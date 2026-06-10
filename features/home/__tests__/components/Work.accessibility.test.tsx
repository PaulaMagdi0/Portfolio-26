import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Work } from '@/features/home/components/Work';

describe('Work accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<Work />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
