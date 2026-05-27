export interface Certification {
  id: string;
  nameKey: string;
  issuerKey: string;
  division?: string;
  issued: string;
  expires?: string;
  credentialId: string;
  skills: readonly string[];
  logo: string;
  descKey: string;
}
