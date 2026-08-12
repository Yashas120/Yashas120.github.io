import type { Metadata } from "next";

const title = "Yashas Kadambi — Distributed Systems & Infrastructure";
const description =
  "Systems engineer with production experience across multi-region AWS infrastructure, asynchronous event flows, dependency-aware deployment, live database migration, service reliability, and systems performance.";
const url = "https://yashas120.github.io/cluster";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: "website",
    siteName: "Yashas Kadambi",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// Paint the cluster canvas before first paint so a light site-wide theme can't
// flash through while the film hydrates. Defaults to dark, matching the page.
// Injects a stylesheet (rather than inline attributes, which would trip React's
// hydration attribute check) so the canvas is correct on the very first paint.
const canvasInit = `(function(){try{var m=localStorage.getItem('cluster-theme');var c=(m==='light')?'#F3F0E8':'#0D1117';var s=document.createElement('style');s.setAttribute('data-cluster-canvas','');s.appendChild(document.createTextNode('html,body{background-color:'+c+';}'));document.head.appendChild(s);}catch(e){}})();`;

export default function ClusterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: canvasInit }} />
      {children}
    </>
  );
}
