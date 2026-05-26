import { SITE_URL } from './site.config';

export const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Paula Magdy',
  jobTitle: 'Software Engineer',
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  email: 'mailto:paulamagdy665@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cairo',
    addressCountry: 'EG',
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
