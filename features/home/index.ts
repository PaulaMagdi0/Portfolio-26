// --- Types ---
export type {
  WorkMetric,
  WorkCaseStudy,
  WorkKind,
  WorkProject,
  ExperienceRole,
  Certification,
  StackGroup,
  MarqueeTool,
  Social,
  FaqItem,
} from './types';

// --- Config ---
export {
  WORK,
  EXPERIENCE,
  CERTIFICATIONS,
  STACK,
  MARQUEE_TOOLS,
  SOCIALS,
  RECIPIENT_EMAIL,
  FAQ_ITEMS,
} from './config';

// --- Utils ---
export { buildHomeMarkdown } from './utils/buildHomeMarkdown';

// --- Components ---
export {
  AnimatedMetric,
  CaseStudyDrawer,
  Certifications,
  Contact,
  CSBlock,
  Education,
  EmailCopyButton,
  Experience,
  FAQ,
  FaqAccordion,
  Hero,
  Hero3DLazy,
  HeroMetaStrip,
  MetaCell,
  Stack,
  Work,
  WorkRow,
} from './components';
