export interface WorkMetric {
  value: string;
  labelKey: string;
}

export interface WorkCaseStudy {
  roleKey: string;
  problemKey: string;
  architectureKey: string;
  contributionsKey: string;
}

export type WorkKind = 'live' | 'private';

export interface WorkProject {
  id: string;
  nameKey: string;
  companyKey: string;
  periodKey: string;
  blurbKey: string;
  metrics: readonly WorkMetric[];
  stack: readonly string[];
  /** Optional screenshot in `/public`. When absent, the gradient/monogram card renders. */
  image?: string;
  swatch: readonly [string, string, string];
  kind: WorkKind;
  url?: string;
  badgeKey: string;
  caseStudy: WorkCaseStudy;
}
