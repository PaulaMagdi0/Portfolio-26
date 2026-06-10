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
  // Structured occupation (with the O*NET-SOC code for Software Developers) so
  // answer engines classify Paula as a software engineer as a first-class fact —
  // not merely a title string. This is the attribute that most directly separates
  // this entity from other people who share the name "Paula Magdy".
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Software Engineer',
    occupationalCategory: '15-1252.00',
  },
  gender: 'Male',
  description:
    'Paula Magdy is a full-stack software engineer with experience designing, building, and scaling modern software systems across web, cloud, and backend platforms. Skilled in JavaScript, TypeScript, Python, PHP, cloud infrastructure, and DevOps practices. Experienced in delivering reliable, maintainable, and scalable solutions throughout the entire software lifecycle—from architecture and development to deployment and optimization.',
  // schema.org's purpose-built field for telling apart same-named entities. A
  // tight role + employer + location + education phrase gives answer engines a
  // compact set of distinctive facts to anchor THIS Paula Magdy to.
  disambiguatingDescription:
    'Full-stack software engineer based in Cairo, Egypt, working at Challenge Group; graduate of October 6 University.',
  url: SITE_URL,
  image: `${SITE_URL}/og-en-v2.png`,
  email: 'paulamagdy665@gmail.com',
  telephone: '+201277767028',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cairo',
    addressCountry: 'EG',
  },
  // Identity attributes that add distinctive, verifiable facts to the entity.
  nationality: { '@type': 'Country', name: 'Egypt' },
  knowsLanguage: ['English', 'Arabic'],
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
      name: 'AWS Certified Solutions Architect – Associate',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: 'Amazon Web Services' },
      dateCreated: '2026-06-01',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'AWS Certified Cloud Practitioner',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: 'Amazon Web Services' },
      dateCreated: '2026-04-01',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'HCCDA-Tech Essentials',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: 'Huawei' },
      dateCreated: '2026-05-01',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'HCIA-AI Certification',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: 'Huawei' },
      dateCreated: '2020-08-01',
    },
  ],
  sameAs: [
    'https://github.com/PaulaMagdi0',
    'https://www.linkedin.com/in/paula-magdy/',
    'https://leetcode.com/u/4pAckTIlBP/',
    'https://www.hackerrank.com/profile/paulamagdy665',
  ],
} as const;
