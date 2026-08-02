import type { MarqueeTool, StackGroup } from '../types';

// Logos are vendored under public/icons/ (sourced from Simple Icons + Devicon) so
// the app has zero runtime dependency on external icon CDNs and the CSP needs no
// CDN allowances. The .marquee-logo filter flattens every logo to mono black/white,
// so the source color is irrelevant.
const SI = (slug: string) => `/icons/${slug}.svg`;

// Groups and ordering mirror the SKILLS block of the résumé (public/resume.pdf),
// so the two stay legible side by side.
export const STACK: readonly StackGroup[] = [
  {
    titleKey: 'home.stack.languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'PHP', 'SQL', 'C++'],
  },
  {
    titleKey: 'home.stack.frontend',
    items: [
      'React',
      'Next.js',
      'Tailwind CSS',
      'Bootstrap',
      'CSS',
      'HTML',
      'Livewire',
      'Filament',
      'Blade',
    ],
  },
  {
    titleKey: 'home.stack.backend',
    items: [
      'Node.js',
      'NestJS',
      'Express',
      'Laravel',
      'Django',
      'Flask',
      'REST APIs',
      'WebSockets',
      'Reverb',
      'Serverless',
      'JWT',
      'RBAC',
    ],
  },
  {
    titleKey: 'home.stack.databases',
    items: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'Prisma ORM',
      'Eloquent ORM',
      'Query optimization',
    ],
  },
  {
    titleKey: 'home.stack.cloud',
    items: ['AWS', 'Huawei Cloud', 'Microsoft Azure', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    titleKey: 'home.stack.testing',
    items: [
      'Vitest',
      'Jest',
      'PHPUnit',
      'Pest',
      'React Testing Library',
      'Playwright',
      'Domain-Driven Design',
      'Agile/Scrum',
    ],
  },
] as const satisfies readonly StackGroup[];

export const MARQUEE_TOOLS: readonly MarqueeTool[] = [
  { name: 'React', src: SI('react') },
  { name: 'Next.js', src: SI('nextdotjs') },
  { name: 'TypeScript', src: SI('typescript') },
  { name: 'JavaScript', src: SI('javascript') },
  { name: 'HTML', src: SI('html5') },
  { name: 'CSS', src: SI('css') },
  { name: 'Tailwind CSS', src: SI('tailwindcss') },
  { name: 'Bootstrap', src: SI('bootstrap') },
  { name: 'Vitest', src: SI('vitest') },
  { name: 'Playwright', src: '/icons/playwright.svg' },
  { name: 'React Testing Library', src: SI('testinglibrary') },
  { name: 'Node.js', src: SI('nodedotjs') },
  { name: 'NestJS', src: SI('nestjs') },
  { name: 'Express', src: SI('express') },
  { name: 'Django', src: SI('django') },
  { name: 'Flask', src: SI('flask') },
  { name: 'Laravel', src: SI('laravel') },
  { name: 'Livewire', src: SI('livewire') },
  { name: 'Filament', src: SI('filament') },
  { name: 'JWT', src: SI('jsonwebtokens') },
  { name: 'Serverless', src: SI('serverless') },
  { name: 'Jest', src: SI('jest') },
  { name: 'Redis', src: SI('redis') },
  { name: 'PostgreSQL', src: SI('postgresql') },
  { name: 'MySQL', src: SI('mysql') },
  { name: 'MongoDB', src: SI('mongodb') },
  { name: 'Prisma', src: SI('prisma') },
  { name: 'AWS', src: '/icons/aws-wordmark.svg' },
  { name: 'Azure', src: '/icons/azure.svg' },
  { name: 'Huawei Cloud', src: '/icons/huawei.svg' },
  { name: 'Docker', src: SI('docker') },
  { name: 'Kubernetes', src: SI('kubernetes') },
  { name: 'Python', src: SI('python') },
  { name: 'PHP', src: SI('php') },
  { name: 'C++', src: SI('cplusplus') },
] as const satisfies readonly MarqueeTool[];
