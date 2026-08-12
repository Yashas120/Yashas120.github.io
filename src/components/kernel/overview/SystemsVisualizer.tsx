"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { kernelPortfolio, type KernelScene } from "@/data/kernelPortfolio";
import styles from "./kernel-overview.module.css";

export function SystemsVisualizer({ compact = false }: Readonly<{ compact?: boolean }>) {
  const [scene, setScene] = useState<KernelScene>("identity");

  useEffect(() => {
    if (compact || !("IntersectionObserver" in window)) return;
    const targets: { element: HTMLElement; nextScene: KernelScene }[] = Object.entries(kernelPortfolio.sceneBySection)
      .flatMap(([id, nextScene]) => {
        const element = document.getElementById(id);
        return element ? [{ element, nextScene: nextScene as KernelScene }] : [];
      });

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = targets.find((item) => item.element === visible.target);
        if (match) setScene(match.nextScene);
      },
      { rootMargin: "-24% 0px -54%", threshold: [0, 0.15, 0.4, 0.7] }
    );

    targets.forEach(({ element }) => observer.observe(element));
    return () => observer.disconnect();
  }, [compact]);

  const visual = kernelPortfolio.sceneVisuals[scene];

  return (
    <figure className={`${styles.visualizer} ${compact ? styles.visualizerCompact : ""}`}>
      <div className={styles.visualizerHeader}>
        <span>{visual.kicker}</span>
        <span aria-hidden="true" className={styles.signalDots}>
          <i /> <i /> <i />
        </span>
      </div>
      <div className={styles.visualizerBody} aria-hidden="true">
        <div className={styles.visualizerCore}>yashOS</div>
        <div className={styles.visualizerTrack}>
          {visual.nodes.map((node, index) => (
            <div className={styles.visualNode} key={node}>
              <span className={styles.nodeIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span>{node}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption>
        <span className={styles.visualizerTitle}>{visual.title}</span>
        <span className={styles.visualizerDescription}>{visual.description}</span>
        <span className={styles.visualizerStatus}>
          <CheckCircle2 aria-hidden="true" /> {visual.status}
        </span>
      </figcaption>
    </figure>
  );
}
