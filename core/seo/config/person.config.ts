import { SITE_URL } from './site.config';

export const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Paula Magdy',
  jobTitle: 'Full-Stack Software Engineer',
  description:
    'Paula Magdy is a full-stack software engineer based in Cairo, Egypt, specializing in scalable web platforms, backend APIs, and cloud infrastructure.',
  url: SITE_URL,
  image: `${SITE_URL}/og-en.png`,
  email: 'mailto:paulamagdy665@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cairo',
    addressCountry: 'EG',
  },
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'October 6 University',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Challenge Group International',
  },
  knowsAbout: [
    'Next.js',
    'NestJS',
    'TypeScript',
    'PostgreSQL',
    'AWS',
    'Software Architecture',
    'Domain-Driven Design',
  ],
  sameAs: ['https://github.com/PaulaMagdi0', 'https://www.linkedin.com/in/paula-magdy/'],
} as const;
