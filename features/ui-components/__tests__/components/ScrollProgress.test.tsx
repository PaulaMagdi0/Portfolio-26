import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollProgress } from '@/features/ui-components';

describe('ScrollProgress', () => {
  it('renders a hidden progress track', () => {
    const { container } = render(<ScrollProgress />);
    const track = container.querySelector('div[aria-hidden]');
    expect(track).toBeInTheDocument();
  });
});
