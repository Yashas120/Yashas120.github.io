import type { Metadata } from "next";
import { education, identity, meta } from "@/data/devops/profile";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: meta.url },
  openGraph: {
    title: meta.ogTitle,
    description: meta.ogDescription,
    url: meta.url,
    type: "website",
    siteName: "Yashas Kadambi",
    images: [{ url: meta.socialImage, width: 1200, height: 630, alt: "Yashas Kadambi — DevOps and Platform Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.ogTitle,
    description: meta.ogDescription,
    images: [meta.socialImage],
  },
};

/**
 * Person JSON-LD. Only verifiable, already-public facts: name, role description,
 * the profiles that prove identity, and the two schools. Employment details and
 * self-asserted skills are deliberately absent — structured data is not the place
 * to make claims the page itself withholds.
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yashas Kadambi",
  url: meta.url,
  jobTitle: identity.role,
  description: meta.description,
  email: identity.email,
  sameAs: [identity.github, identity.linkedin],
  alumniOf: [{ "@type": "CollegeOrUniversity", name: education.pes.school }],
};

export default function DevToolsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled object; no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {children}
    </>
  );
}
