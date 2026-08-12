/**
 * Disclosure review for employer-scale figures.
 *
 * Exact internal numbers are held behind an explicit `approved` flag. While it
 * is false the public-safe `fallback` renders instead — the claim is weakened,
 * never replaced with an invented substitute, and `exact` is never displayed.
 *
 * This is the same contract `src/lib/clusterContent.ts` uses; it lives here so
 * more than one endpoint can share a single review decision.
 */
export interface Disclosure {
  approved: boolean;
  exact: string[];
  fallback: string;
  /** Internal reviewer note. Never rendered. */
  note?: string;
}

export function disclose(d: Disclosure): string[] {
  return d.approved ? d.exact : [d.fallback];
}

export interface Fact {
  label: string;
  value: string;
}

/** A grid of exact figures that is simply withheld until the review clears it. */
export interface DisclosedFacts {
  approved: boolean;
  exact: Fact[];
  note?: string;
}

export function discloseFacts(d: DisclosedFacts): Fact[] | null {
  return d.approved ? d.exact : null;
}
