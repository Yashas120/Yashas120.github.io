import type { Metadata } from "next";
import { fdeMetaDossier } from "@/data/fdeDossier";

export const metadata: Metadata = {
  title: fdeMetaDossier.title,
  description: fdeMetaDossier.description,
  alternates: { canonical: fdeMetaDossier.url },
  openGraph: {
    title: fdeMetaDossier.ogTitle,
    description: fdeMetaDossier.ogDescription,
    url: fdeMetaDossier.url,
    type: "website",
    siteName: "Yashas Kadambi",
  },
  twitter: {
    card: "summary_large_image",
    title: fdeMetaDossier.ogTitle,
    description: fdeMetaDossier.ogDescription,
  },
};

export default function FdeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
