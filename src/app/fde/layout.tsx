import type { Metadata } from "next";
import { fdeMeta } from "@/data/fde";

export const metadata: Metadata = {
  title: fdeMeta.title,
  description: fdeMeta.description,
  alternates: { canonical: fdeMeta.url },
  openGraph: {
    title: fdeMeta.ogTitle,
    description: fdeMeta.ogDescription,
    url: fdeMeta.url,
    type: "website",
    siteName: "Yashas Kadambi",
  },
  twitter: {
    card: "summary_large_image",
    title: fdeMeta.ogTitle,
    description: fdeMeta.ogDescription,
  },
};

export default function FdeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
