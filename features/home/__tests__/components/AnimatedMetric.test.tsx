import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedMetric } from '@/features/home/components/AnimatedMetric';

// IntersectionObserver is mocked in vitest.setup.ts and never fires, so these
// assertions cover the server-rendered / first-paint text.

describe('AnimatedMetric', () => {
  it('renders comparator values statically instead of counting up from zero', () => {
    render(<AnimatedMetric value="<5 min" />);
    expect(screen.getByText('<5 min')).toBeInTheDocument();
  });

  it('keeps thousands grouping on the initial frame and isolates direction', () => {
    render(<AnimatedMetric value="5,000+" />);
    const el = screen.getByText('0+');
    expect(el).toHaveAttribute('dir', 'ltr');
  });

  it('preserves the sign of negative deltas', () => {
    render(<AnimatedMetric value="−35%" />);
    expect(screen.getByText('−0%')).toBeInTheDocument();
  });

  it('passes non-numeric values through unchanged', () => {
    render(<AnimatedMetric value="EN/AR" />);
    expect(screen.getByText('EN/AR')).toBeInTheDocument();
  });
});
