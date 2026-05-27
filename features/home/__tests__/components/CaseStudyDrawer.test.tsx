import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaseStudyDrawer } from '@/features/home/components/CaseStudyDrawer';
import type { WorkProject } from '@/features/home/types';

type AnyProps = { children?: React.ReactNode; [key: string]: unknown };

function stripMotionProps({ children, initial, animate, exit, transition, ...rest }: AnyProps) {
  void initial;
  void animate;
  void exit;
  void transition;
  return { children, rest };
}

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
      aside: (props: AnyProps) => {
        const { children, rest } = stripMotionProps(props);
        return <aside {...(rest as React.HTMLAttributes<HTMLElement>)}>{children}</aside>;
      },
    },
  };
});

const project: WorkProject = {
  id: 'test',
  nameKey: 'home.work.test.name',
  companyKey: 'home.work.test.company',
  periodKey: 'home.work.test.period',
  blurbKey: 'home.work.test.blurb',
  metrics: [],
  stack: [],
  swatch: ['#000', '#111', '#222'],
  kind: 'private',
  badgeKey: 'home.work.test.badge',
  caseStudy: {
    roleKey: 'home.work.test.cs.role',
    problemKey: 'home.work.test.cs.problem',
    architectureKey: 'home.work.test.cs.architecture',
    contributionsKey: 'home.work.test.cs.contributions',
  },
};

describe('CaseStudyDrawer', () => {
  it('renders nothing when project is null', () => {
    const { container } = render(<CaseStudyDrawer project={null} onClose={vi.fn()} />);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders dialog when a project is provided', () => {
    render(<CaseStudyDrawer project={project} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onClose when escape is pressed', async () => {
    const onClose = vi.fn();
    render(<CaseStudyDrawer project={project} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
