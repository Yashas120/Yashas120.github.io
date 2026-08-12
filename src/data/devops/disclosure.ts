/**
 * Disclosure decisions for /devtools.
 *
 * The route's factual copy is gated here rather than inline, so a single review
 * decision changes what the page publishes. The rule is the same one
 * `src/lib/disclosure.ts` encodes for the other endpoints: when a figure is not
 * cleared, the claim is weakened to a public-safe form — it is never replaced
 * with an invented substitute.
 */

export type DisclosureState = "public" | "approval-required" | "private";

/**
 * CMocka figures (122 production sources, ~430 stubbed boundaries,
 * ~30 minutes → ~10 seconds).
 *
 * Owner-authorised for this route: the same numbers are already published on
 * `/fde` (see src/data/fdeDossier.ts). Setting this to false swaps every
 * affected string on the page to the public-safe variant, which keeps the
 * mechanism and drops the measurements.
 */
export const cmockaCleared = true;

/**
 * Employer-scale figures that remain withheld by default on this route:
 * service, endpoint, integration, team, repository, account, region, customer
 * and user counts; API call volume; outage counts; product counts for the
 * authentication migration; air-gapped VM counts; revenue context; MTTR.
 *
 * Nothing on this page renders these. The flag exists so the omission is a
 * recorded decision rather than an oversight.
 */
export const employerScaleCleared = false;

/**
 * The AWS credential's issue date and verification URL are only published once
 * the official credential record has been retrieved. Until then the
 * certification is named without a date or a link, because an unverified
 * verification link is worse than none.
 */
export const awsCredentialRecordVerified = false;
