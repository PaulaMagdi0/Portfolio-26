import { SITE_URL } from './site.config';

// Schema.org Person node. Emitted (wrapped in an @graph alongside a ProfilePage)
// by buildPersonJsonLd. The stable `@id` turns this from an anonymous claim into
// an addressable entity that off-site sources (LinkedIn, GitHub, Wikidata) can
// resolve to — the foundation for AI answer engines describing Paula correctly.
export const PERSON_JSON_LD = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Paula Magdy',
  jobTitle: 'Full-Stack Software Engineer',
  description:
    'Paula Magdy is a full-stack software engineer with experience designing, building, and scaling modern software systems across web, cloud, and backend platforms. Skilled in JavaScript, TypeScript, Python, PHP, cloud infrastructure, and DevOps practices. Experienced in delivering reliable, maintainable, and scalable solutions throughout the entire software lifecycle—from architecture and development to deployment and optimization.',
  url: SITE_URL,
  image: `${SITE_URL}/og-en-v2.png`,
  email: 'paulamagdy665@gmail.com',
  telephone: '+201277767028',
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
    name: 'Challenge Group',
    url: 'https://challengegroup.org',
  },
  knowsAbout: [
    'Full-stack web development',
    'Next.js',
    'React',
    'TypeScript',
    'Node.js',
    'NestJS',
    'Python',
    'PostgreSQL',
    'Prisma ORM',
    'REST API design',
    'AWS cloud infrastructure',
    'Docker',
    'CI/CD pipelines',
    'Software architecture',
    'Domain-Driven Design',
  ],
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'AWS Certified Cloud Practitioner',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: 'Amazon Web Services' },
      dateCreated: '2026-04',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'HCCDA-Tech Essentials',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: 'Huawei' },
      dateCreated: '2026-05',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'HCIA-AI Certification',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: 'Huawei' },
      dateCreated: '2020-08',
    },
  ],
  sameAs: [
    'https://github.com/PaulaMagdi0',
    'https://www.linkedin.com/in/paula-magdy/',
    'https://leetcode.com/u/4pAckTIlBP/',
    'https://www.hackerrank.com/profile/paulamagdy665',
  ],
} as const;
