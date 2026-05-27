import type { ExperienceRole } from '../types';

export const EXPERIENCE: readonly ExperienceRole[] = [
  {
    periodKey: 'home.experience.r1.period',
    roleKey: 'home.experience.r1.role',
    companyKey: 'home.experience.r1.company',
    locationKey: 'home.experience.r1.location',
    bulletKeys: ['home.experience.r1.b1', 'home.experience.r1.b2', 'home.experience.r1.b3'],
  },
  {
    periodKey: 'home.experience.r2.period',
    roleKey: 'home.experience.r2.role',
    companyKey: 'home.experience.r2.company',
    locationKey: 'home.experience.r2.location',
    bulletKeys: ['home.experience.r2.b1', 'home.experience.r2.b2'],
  },
  {
    periodKey: 'home.experience.r3.period',
    roleKey: 'home.experience.r3.role',
    companyKey: 'home.experience.r3.company',
    locationKey: 'home.experience.r3.location',
    bulletKeys: ['home.experience.r3.b1', 'home.experience.r3.b2'],
  },
] as const satisfies readonly ExperienceRole[];
