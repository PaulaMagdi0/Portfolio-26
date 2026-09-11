export interface ExperienceRole {
  periodKey: string;
  roleKey: string;
  companyKey: string;
  locationKey: string;
  /** Optional one-line employer/role context rendered under the company line (not a bullet). */
  summaryKey?: string;
  bulletKeys: readonly string[];
}
