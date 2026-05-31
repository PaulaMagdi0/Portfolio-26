import type { MarqueeTool, StackGroup } from '../types';

const SI = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
const DEV = (path: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${path}`;

export const STACK: readonly StackGroup[] = [
  {
    titleKey: 'home.stack.frontend',
    items: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'HTML',
      'CSS',
      'Tailwind CSS',
      'Vitest',
      'React Testing Library',
      'Playwright',
    ],
  },
  {
    titleKey: 'home.stack.backend',
    items: [
      'Node.js',
      'NestJS',
      'Express',
      'Django',
      'Flask',
      'Laravel',
      'WebSockets',
      'REST APIs',
      'JWT',
      'RBAC',
      'Jest',
      'Redis',
    ],
  },
  {
    titleKey: 'home.stack.databases',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Prisma ORM', 'Query optimization', 'Indexing'],
  },
  {
    titleKey: 'home.stack.cloud',
    items: ['AWS', 'Microsoft Azure', 'Huawei Cloud', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    titleKey: 'home.stack.languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'PHP', 'C++', 'SQL'],
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
  { name: 'Vitest', src: SI('vitest') },
  {
    name: 'Playwright',
    src: DEV('playwright/playwright-original.svg'),
  },
  { name: 'Node.js', src: SI('nodedotjs') },
  { name: 'NestJS', src: SI('nestjs') },
  { name: 'Express', src: SI('express') },
  { name: 'Django', src: SI('django') },
  { name: 'Flask', src: SI('flask') },
  { name: 'Laravel', src: SI('laravel') },
  { name: 'Jest', src: SI('jest') },
  { name: 'Redis', src: SI('redis') },
  { name: 'PostgreSQL', src: SI('postgresql') },
  { name: 'MySQL', src: SI('mysql') },
  { name: 'MongoDB', src: SI('mongodb') },
  { name: 'Prisma', src: SI('prisma') },
  {
    name: 'AWS',
    src: DEV('amazonwebservices/amazonwebservices-original-wordmark.svg'),
  },
  { name: 'Azure', src: DEV('azure/azure-original.svg') },
  { name: 'Docker', src: SI('docker') },
  { name: 'Kubernetes', src: SI('kubernetes') },
  { name: 'Python', src: SI('python') },
  { name: 'PHP', src: SI('php') },
  { name: 'C++', src: SI('cplusplus') },
] as const satisfies readonly MarqueeTool[];
