import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Certifications } from '@/features/home/components/Certifications';

describe('Certifications accessibility', () => {
  it('has no a11y violations', async () => {
    const ui = await Certifications();
    const { container } = render(<>{ui}</>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
