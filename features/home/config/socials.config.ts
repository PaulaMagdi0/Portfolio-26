import type { Social } from '../types';

export const RECIPIENT_EMAIL = 'paulamagdy665@gmail.com';

export const SOCIALS: readonly Social[] = [
  { labelKey: 'home.contact.socials.github', url: 'https://github.com/PaulaMagdi0' },
  {
    labelKey: 'home.contact.socials.linkedin',
    url: 'https://www.linkedin.com/in/paula-magdy/',
  },
  { labelKey: 'home.contact.socials.leetcode', url: 'https://leetcode.com/u/4pAckTIlBP/' },
  {
    labelKey: 'home.contact.socials.hackerrank',
    url: 'https://www.hackerrank.com/profile/paulamagdy665',
  },
] as const satisfies readonly Social[];
