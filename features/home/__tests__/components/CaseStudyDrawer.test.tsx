import React from 'react';
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
  const passthrough = (tag: string) => {
    const Passthrough = (props: AnyProps) => {
      const { children, rest } = stripMotionProps(props);
      return React.createElement(tag, rest as Record<string, unknown>, children);
    };
    Passthrough.displayName = `motion.${tag}`;
    return Passthrough;
  };
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: new Proxy(actual.motion as object, {
      get: (target, prop) => {
        if (typeof prop !== 'string') return Reflect.get(target, prop);
        return passthrough(prop);
      },
    }),
  };
});

const project: WorkProject = {
  id: 'test',
  nameKey: 'home.work.test.name',
  companyKey: 'home.work.test.company',
  periodKey: 'home.work.test.period',
  blurbKey: 'home.work.test.blurb',
  highlights: [],
  stack: [],
  swatch: ['#000', '#111', '#222'],
  badgeKey: 'home.work.test.badge',
  caseStudy: {
    roleKey: 'home.work.test.cs.role',
    overviewKey: 'home.work.test.cs.overview',
    systemKey: 'home.work.test.cs.system',
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

  it('moves focus to the close button when opened', () => {
    render(<CaseStudyDrawer project={project} onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'home.work.caseStudy.close' })).toHaveFocus();
  });

  it('labels the dialog with the project title', () => {
    render(<CaseStudyDrawer project={project} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'home.work.test.name' })).toBeInTheDocument();
  });

  it('returns focus to the opener when closed', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    const { rerender } = render(
      <CaseStudyDrawer project={project} onClose={vi.fn()} returnFocusTo={opener} />,
    );
    rerender(<CaseStudyDrawer project={null} onClose={vi.fn()} returnFocusTo={opener} />);
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('calls onClose when escape is pressed', async () => {
    const onClose = vi.fn();
    render(<CaseStudyDrawer project={project} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
