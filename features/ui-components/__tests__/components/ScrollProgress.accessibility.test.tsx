import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ScrollProgress } from '@/features/ui-components';

describe('ScrollProgress accessibility', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<ScrollProgress />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
