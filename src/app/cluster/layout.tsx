import type { Metadata } from "next";

const title = "Yashas Kadambi — Production Systems, Infrastructure, and Reliability";
const description =
  "A complete engineering portfolio ordered through a distributed-systems lens: about three years of Cisco production work, systems projects, research, teaching, and technical breadth.";
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
    images: [{ url: "https://yashas120.github.io/icon.svg", alt: "Yashas Kadambi portfolio" }],
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
