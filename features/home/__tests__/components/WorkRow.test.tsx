import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkRow } from '@/features/home/components/WorkRow';
import type { LiveWorkProject, PrivateWorkProject, WorkProject } from '@/features/home/types';

const base = {
  id: 'test',
  image: '/work/test.webp',
  nameKey: 'home.work.test.name',
  companyKey: 'home.work.test.company',
  periodKey: 'home.work.test.period',
  blurbKey: 'home.work.test.blurb',
  highlights: [],
  stack: ['Next.js'],
  swatch: ['#000', '#111', '#222'],
  badgeKey: 'home.work.test.badge',
  caseStudy: {
    roleKey: 'home.work.test.cs.role',
    overviewKey: 'home.work.test.cs.overview',
    systemKey: 'home.work.test.cs.system',
    contributionsKey: 'home.work.test.cs.contributions',
  },
} satisfies Omit<PrivateWorkProject, 'kind'>;

const live: LiveWorkProject = { ...base, kind: 'live', url: 'https://example.com/en' };
const priv: PrivateWorkProject = { ...base, kind: 'private' };

function renderRow(project: WorkProject) {
  const onOpen = vi.fn();
  render(
    <ol>
      <WorkRow project={project} index={0} total={1} onOpen={onOpen} />
    </ol>,
  );
  return onOpen;
}

describe('WorkRow', () => {
  it('renders the screenshot with a descriptive alt', () => {
    renderRow(priv);
    const img = screen.getByRole('img', { name: 'home.work.screenshotAlt' });
    expect(img.getAttribute('src')).toContain('test.webp');
  });

  it('marks live products and links to the public site in a new tab', () => {
    renderRow(live);
    const link = screen.getByRole('link', { name: /home\.work\.visit/ });
    expect(link).toHaveAttribute('href', 'https://example.com/en');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(screen.getByText('home.work.kind.live')).toBeInTheDocument();
  });

  it('shows private products without a visit link', () => {
    renderRow(priv);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('home.work.kind.private')).toBeInTheDocument();
  });

  it('opens the case study from anywhere on the card except the visit link', async () => {
    const user = userEvent.setup();
    const onOpen = renderRow(live);
    await user.click(screen.getByText('home.work.test.blurb'));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen.mock.calls[0]?.[0]).toBe(live);
    expect(onOpen.mock.calls[0]?.[1]).toBe(
      screen.getByRole('button', { name: /home\.work\.test\.name/ }),
    );

    const link = screen.getByRole('link', { name: /home\.work\.visit/ });
    // jsdom cannot navigate; stop the default action so only the forwarding logic is exercised.
    link.addEventListener('click', (e) => e.preventDefault());
    await user.click(link);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('falls back to the monogram card when the screenshot fails to load', () => {
    renderRow(priv);
    // user-event has no equivalent for a resource error event.
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).toBeNull();
    // First character of the (mocked) title.
    expect(screen.getByText('h')).toBeInTheDocument();
  });
});
