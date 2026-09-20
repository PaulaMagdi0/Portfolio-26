import type { ExperienceRole } from '../types';

// Roles and bullets mirror the PROFESSIONAL EXPERIENCE block of the résumé
// (public/resume.pdf), in the same order, so the two stay legible side by side.
export const EXPERIENCE: readonly ExperienceRole[] = [
  {
    periodKey: 'home.experience.r1.period',
    roleKey: 'home.experience.r1.role',
    companyKey: 'home.experience.r1.company',
    locationKey: 'home.experience.r1.location',
    summaryKey: 'home.experience.r1.summary',
    bulletKeys: [
      'home.experience.r1.b1',
      'home.experience.r1.b2',
      'home.experience.r1.b3',
      'home.experience.r1.b4',
      'home.experience.r1.b5',
      'home.experience.r1.b6',
      'home.experience.r1.b7',
      'home.experience.r1.b8',
      'home.experience.r1.b9',
    ],
  },
  {
    periodKey: 'home.experience.r2.period',
    roleKey: 'home.experience.r2.role',
    companyKey: 'home.experience.r2.company',
    locationKey: 'home.experience.r2.location',
    summaryKey: 'home.experience.r2.summary',
    bulletKeys: ['home.experience.r2.b1', 'home.experience.r2.b2'],
  },
  {
    periodKey: 'home.experience.r3.period',
    roleKey: 'home.experience.r3.role',
    companyKey: 'home.experience.r3.company',
    locationKey: 'home.experience.r3.location',
    summaryKey: 'home.experience.r3.summary',
    bulletKeys: ['home.experience.r3.b1', 'home.experience.r3.b2', 'home.experience.r3.b3'],
  },
] as const satisfies readonly ExperienceRole[];
