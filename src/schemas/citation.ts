/** Shared citation shape. Year is required when the citation supports a legal fact. */
export interface Citation {
  source: string;
  year?: number;
  url?: string;
}
