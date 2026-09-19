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

/** `live` products have a public URL visitors can open; `private` ones are case studies only. */
export type WorkKind = 'live' | 'private';

interface WorkProjectBase {
  /** Neutral slug; rendered on the card's image overlay and used for DOM ids. */
  id: string;
  nameKey: string;
  companyKey: string;
  periodKey: string;
  blurbKey: string;
  /** Up to three scannable facts shown on the row and in the drawer. May be empty. */
  highlights: readonly WorkHighlight[];
  stack: readonly string[];
  /** Screenshot under `/public`. If it fails to load, the gradient/monogram card renders instead. */
  image: string;
  swatch: readonly [string, string, string];
  badgeKey: string;
  caseStudy: WorkCaseStudy;
}

export interface LiveWorkProject extends WorkProjectBase {
  kind: 'live';
  /** Public site, opened in a new tab from the card and the drawer. */
  url: string;
}

export interface PrivateWorkProject extends WorkProjectBase {
  kind: 'private';
  url?: never;
}

/**
 * A Work card. Every card opens its case-study drawer; live products additionally
 * link out to the public site. The copy policy (team framing, only corroborated
 * numbers) is enforced by __tests__/config/work.policy.test.ts.
 */
export type WorkProject = LiveWorkProject | PrivateWorkProject;
