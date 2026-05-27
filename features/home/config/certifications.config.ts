import type { Certification } from '../types';

export const CERTIFICATIONS: readonly Certification[] = [
  {
    id: 'hccda',
    nameKey: 'home.certs.hccda.name',
    issuerKey: 'home.certs.hccda.issuer',
    division: 'HUAWEI CLOUD',
    issued: 'May 2026',
    expires: 'May 2029',
    credentialId: 'HWENDCTEDA542672',
    skills: ['Cloud Architecture', 'Huawei Cloud', 'Cloud Foundations'],
    logo: 'https://cdn.simpleicons.org/huawei',
    descKey: 'home.certs.hccda.desc',
  },
  {
    id: 'aws-ccp',
    nameKey: 'home.certs.aws-ccp.name',
    issuerKey: 'home.certs.aws-ccp.issuer',
    issued: 'Apr 2026',
    expires: 'Apr 2029',
    credentialId: '72b404c5-b893-47a9-a8dc-688a9337ce57',
    skills: ['Cloud Computing', 'Cloud Services', 'AWS Foundations'],
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
    descKey: 'home.certs.aws-ccp.desc',
  },
  {
    id: 'hcia-ai',
    nameKey: 'home.certs.hcia-ai.name',
    issuerKey: 'home.certs.hcia-ai.issuer',
    issued: 'Aug 2020',
    expires: 'Aug 2023',
    credentialId: '01010200180804649576366',
    skills: ['Python', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning'],
    logo: 'https://cdn.simpleicons.org/huawei',
    descKey: 'home.certs.hcia-ai.desc',
  },
] as const satisfies readonly Certification[];
