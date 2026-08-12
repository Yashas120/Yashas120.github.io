import type { Metadata } from "next";
import { KernelPortfolioOverview } from "@/components/kernel/overview/KernelPortfolioOverview";

const description =
  "Yashas Kadambi is a systems software engineer with production experience across Linux, optical line-card hardware, C/C++ validation infrastructure, secure boot, and performance experiments.";

export const metadata: Metadata = {
  title: "Yashas Kadambi — Systems Software Engineer",
  description,
  alternates: { canonical: "https://yashas120.github.io/kernel/" },
  openGraph: {
    title: "Yashas Kadambi — Systems Software Engineer",
    description,
    type: "profile",
    url: "https://yashas120.github.io/kernel/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yashas Kadambi — Systems Software Engineer",
    description,
  },
};

export default function KernelPage() {
  return <KernelPortfolioOverview />;
}
