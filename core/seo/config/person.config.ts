import { SITE_URL } from './site.config';

export const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Paula Magdy',
  jobTitle: 'Full-Stack Software Engineer',
  description:
    '"Paula Magdy is a full-stack software engineer building and scaling modern software systems using technologies such as PHP, JavaScript, TypeScript, Python, and cloud platforms. My work spans database design, backend APIs, frontend applications, infrastructure, and CI/CD pipelines. I focus on delivering scalable, reliable, and maintainable solutions while taking ownership of the full development lifecycle, from architecture to deployment.',
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
