export const publicLinks = {
  email: "mailto:ykadambi@ucsd.edu",
  github: "https://github.com/Yashas120",
  linkedin: "https://www.linkedin.com/in/yashas120",
  demos: "/demos",
  portfolioSource: "https://github.com/Yashas120/Yashas120.github.io",
} as const;

/**
 * No canonical public PDF was available during the evidence audit. The visible
 * action therefore opens the verified LinkedIn profile and says so to assistive
 * technology; it never pretends that a private source document is downloadable.
 */
export const resumeLink = {
  href: publicLinks.linkedin,
  ariaLabel: "Résumé profile — Yashas Kadambi on LinkedIn (opens in a new tab)",
  label: "Résumé",
  isPdf: false,
  verificationNote: "[VERIFY BEFORE PUBLICATION: canonical public résumé PDF URL]",
} as const;
