export interface WorkHighlight {
  /** Short display value — a number ("5,000+", "−35%") or a technology name ("Laravel"). */
  value: string;
  labelKey: string;
}

export interface WorkCaseStudy {
  roleKey: string;
  overviewKey: string;
  systemKey: string;
  contributionsKey: string;
}

export type WorkKind = 'live' | 'private';

export interface WorkProject {
  id: string;
  nameKey: string;
  companyKey: string;
  periodKey: string;
  blurbKey: string;
  /** Up to three scannable facts shown on the row and in the drawer. May be empty. */
  highlights: readonly WorkHighlight[];
  stack: readonly string[];
  /** Optional screenshot in `/public`. When absent, the gradient/monogram card renders. */
  image?: string;
  swatch: readonly [string, string, string];
  kind: WorkKind;
  url?: string;
  badgeKey: string;
  caseStudy: WorkCaseStudy;
}
