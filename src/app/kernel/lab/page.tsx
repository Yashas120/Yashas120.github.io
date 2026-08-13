import type { Metadata } from "next";
import { KernelLabRedirect } from "./KernelLabRedirect";

export const metadata: Metadata = {
  title: "yashOS Desktop Compatibility — Yashas Kadambi",
  description: "Compatibility route for the interactive yashOS desktop now integrated into the canonical kernel portfolio experience.",
  alternates: { canonical: "https://yashas120.github.io/kernel/?view=desktop" },
  robots: { index: false, follow: true },
};

export default function KernelLabPage() {
  return <KernelLabRedirect />;
}
