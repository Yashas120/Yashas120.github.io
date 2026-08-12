import type { Metadata } from "next";
import { dpMeta } from "@/data/dataPlane";

export const metadata: Metadata = {
  title: dpMeta.title,
  description: dpMeta.description,
  alternates: { canonical: dpMeta.url },
  openGraph: {
    title: dpMeta.title,
    description: dpMeta.description,
    url: dpMeta.url,
    type: "website",
    siteName: "Yashas Kadambi",
  },
  twitter: {
    card: "summary_large_image",
    title: dpMeta.title,
    description: dpMeta.description,
  },
};

// The route owns a fixed near-black line-card workstation palette rather than
// following the site-wide light theme, so paint that canvas before hydration. A
// stylesheet is injected (rather than inline attributes) so React's hydration
// attribute check is not tripped — the same approach /backend and /cluster use.
const canvasInit = `(function(){try{var s=document.createElement('style');s.setAttribute('data-dataplane-canvas','');s.appendChild(document.createTextNode('html,body{background-color:#070B10;}'));document.head.appendChild(s);}catch(e){}})();`;

export default function DataPlaneLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: canvasInit }} />
      {children}
    </>
  );
}
