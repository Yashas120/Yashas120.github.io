import type { Metadata } from "next";
import { BackendStory } from "@/components/backend/BackendStory";

/**
 * /backend — a standalone endpoint for backend and platform roles.
 *
 * This is a server component: it owns the route metadata and the page skeleton,
 * and holds no portfolio copy of its own. All literal content lives in
 * `src/data/backend.ts`; the scroll story is a client component.
 */
export const metadata: Metadata = {
  title: "Yashas Kadambi — Backend & Platform Engineer",
  description:
    "Backend and platform engineering portfolio of Yashas Kadambi: cloud infrastructure, event-driven systems, delivery automation, and production reliability.",
  alternates: {
    canonical: "/backend",
  },
  openGraph: {
    title: "Yashas Kadambi — Backend & Platform Engineer",
    description:
      "Production engineering across cloud infrastructure, event-driven systems, automation, and reliability.",
    type: "website",
    url: "/backend",
  },
};

export default function BackendPage() {
  return (
    <div className="bk-root">
      <a href="#main-content" className="skip-link m-2 rounded-md border px-3 py-2 text-sm font-medium">
        Skip to main content
      </a>
      <main id="main-content">
        <BackendStory />
      </main>
    </div>
  );
}
