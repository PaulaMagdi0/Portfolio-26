import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Certifications } from '@/features/home/components/Certifications';
import { CERTIFICATIONS } from '@/features/home/config/certifications.config';

describe('Certifications', () => {
  it('links every credential to its public verification page in a new tab', async () => {
    const ui = await Certifications();
    render(<>{ui}</>);
    const links = screen.getAllByRole('link', { name: /home\.certs\.verify/ });
    expect(links).toHaveLength(CERTIFICATIONS.length);
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toEqual(CERTIFICATIONS.map((c) => c.verifyUrl));
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link).toHaveAccessibleName(/ui\.a11y\.opensInNewTab/);
    }
  });

  it('still shows each credential ID next to its link', async () => {
    const ui = await Certifications();
    render(<>{ui}</>);
    for (const cert of CERTIFICATIONS) {
      expect(screen.getByText(cert.credentialId)).toBeInTheDocument();
    }
  });
});
