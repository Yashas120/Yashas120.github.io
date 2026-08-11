"use client";

import { MotionConfig } from "framer-motion";
import { ClusterStory } from "@/components/cluster/ClusterStory";

export default function ClusterPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen text-zinc-300">
        <ClusterStory />
      </main>
    </MotionConfig>
  );
}
