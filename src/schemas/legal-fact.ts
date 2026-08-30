/**
 * A legal claim. `sourceYear` and `publishingBody` are required.
 * No year → does not ship.
 */
export interface LegalFact {
  claim: string;
  publishingBody: string;
  sourceYear: number;
  source: string;
}
