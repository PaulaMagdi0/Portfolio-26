import type { MarqueeTool, StackGroup } from '../types';

// Logos are vendored under public/icons/ (sourced from Simple Icons + Devicon) so
// the app has zero runtime dependency on external icon CDNs and the CSP needs no
// CDN allowances. The .marquee-logo filter flattens every logo to mono black/white,
// so the source color is irrelevant.
const SI = (slug: string) => `/icons/${slug}.svg`;

// Groups, ordering, and items mirror the SKILLS block of the résumé
// (public/resume.pdf), so the two stay legible side by side.
export const STACK: readonly StackGroup[] = [
  {
    titleKey: 'home.stack.languages',
    items: ['TypeScript', 'JavaScript', 'PHP', 'Python', 'SQL'],
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
      'WebSockets (Laravel Reverb)',
      'Serverless (AWS Lambda)',
      'JWT',
      'RBAC',
    ],
  },
  {
    titleKey: 'home.stack.frontend',
    items: ['React', 'Next.js', 'Tailwind CSS', 'Livewire', 'Filament', 'Blade', 'HTML/CSS'],
  },
  {
    titleKey: 'home.stack.cloud',
    items: ['AWS', 'Microsoft Azure', 'Huawei Cloud', 'Docker', 'CI/CD', 'Linux', 'Git'],
  },
  {
    titleKey: 'home.stack.databases',
    items: [
      'PostgreSQL',
      'MySQL',
      'Redis',
      'MongoDB',
      'Prisma ORM',
      'Eloquent ORM',
      'Indexing & query optimization',
    ],
  },
  {
    titleKey: 'home.stack.testing',
    items: [
      'Jest',
      'Vitest',
      'PHPUnit',
      'Pest',
      'React Testing Library',
      'Domain-Driven Design',
      'Agile/Scrum',
    ],
  },
] as const satisfies readonly StackGroup[];

// Only tools that appear in the résumé's SKILLS block and have a vendored logo.
export const MARQUEE_TOOLS: readonly MarqueeTool[] = [
  { name: 'React', src: SI('react') },
  { name: 'Next.js', src: SI('nextdotjs') },
  { name: 'TypeScript', src: SI('typescript') },
  { name: 'JavaScript', src: SI('javascript') },
  { name: 'HTML', src: SI('html5') },
  { name: 'CSS', src: SI('css') },
  { name: 'Tailwind CSS', src: SI('tailwindcss') },
  { name: 'Vitest', src: SI('vitest') },
  { name: 'Jest', src: SI('jest') },
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
  { name: 'Redis', src: SI('redis') },
  { name: 'PostgreSQL', src: SI('postgresql') },
  { name: 'MySQL', src: SI('mysql') },
  { name: 'MongoDB', src: SI('mongodb') },
  { name: 'Prisma', src: SI('prisma') },
  { name: 'AWS', src: '/icons/aws-wordmark.svg' },
  { name: 'Azure', src: '/icons/azure.svg' },
  { name: 'Huawei Cloud', src: '/icons/huawei.svg' },
  { name: 'Docker', src: SI('docker') },
  { name: 'Python', src: SI('python') },
  { name: 'PHP', src: SI('php') },
] as const satisfies readonly MarqueeTool[];
