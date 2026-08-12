import type { Metadata } from "next";
import { KernelLab } from "@/components/kernel/lab/KernelLab";

export const metadata: Metadata = {
  title: "Explore yashOS — Yashas Kadambi",
  description: "Optional interactive yashOS desktop with résumé, work, projects, scheduling, skills, publications, and contact applications.",
  robots: { index: false, follow: true },
};

export default function KernelLabPage() {
  return <KernelLab />;
}
