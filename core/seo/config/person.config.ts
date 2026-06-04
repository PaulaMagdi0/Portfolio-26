import { SITE_URL } from './site.config';

export const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Paula Magdy',
  jobTitle: 'Full-Stack Software Engineer',
  description:
    'Paula Magdy is a full-stack software engineer with experience designing, building, and scaling modern software systems across web, cloud, and backend platforms. Skilled in JavaScript, TypeScript, Python, PHP, cloud infrastructure, and DevOps practices. Experienced in delivering reliable, maintainable, and scalable solutions throughout the entire software lifecycle—from architecture and development to deployment and optimization.',
  url: SITE_URL,
  image: `${SITE_URL}/og-en-v2.png`,
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
