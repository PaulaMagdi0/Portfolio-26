export interface Certification {
  id: string;
  nameKey: string;
  issuerKey: string;
  division?: string;
  issued: string;
  expires?: string;
  credentialId: string;
  /** Public verification page (Credly badge or shared certificate). Opens in a new tab. */
  verifyUrl: string;
  skills: readonly string[];
  logo: string;
  descKey: string;
}
