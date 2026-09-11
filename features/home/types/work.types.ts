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

/**
 * A Work card. Every project is a private case study: there is deliberately no
 * `url`, `image`, or live/private flag — client work must not link out or show
 * screenshots (see work.config.ts and __tests__/config/work.policy.test.ts).
 */
export interface WorkProject {
  id: string;
  nameKey: string;
  companyKey: string;
  periodKey: string;
  blurbKey: string;
  /** Up to three scannable facts shown on the row and in the drawer. May be empty. */
  highlights: readonly WorkHighlight[];
  stack: readonly string[];
  swatch: readonly [string, string, string];
  badgeKey: string;
  caseStudy: WorkCaseStudy;
}
