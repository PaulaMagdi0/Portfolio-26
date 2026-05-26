import { PERSON_JSON_LD } from '../config/person.config';

export function buildPersonJsonLd(): string {
  return JSON.stringify(PERSON_JSON_LD);
}
