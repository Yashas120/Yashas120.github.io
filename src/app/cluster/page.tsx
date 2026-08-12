"use client";

import { MotionConfig } from "framer-motion";
import { ClusterFilm } from "@/components/cluster/ClusterFilm";
import { ClusterThemeProvider } from "@/components/cluster/theme";

export default function ClusterPage() {
  return (
    <MotionConfig reducedMotion="user">
      <ClusterThemeProvider>
        <main id="cluster-content">
          <ClusterFilm />
        </main>
      </ClusterThemeProvider>
    </MotionConfig>
  );
}
