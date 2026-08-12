"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { CopyBlock, GREEN } from "./kit";
import { leverageItems, type DossierScene } from "@/data/fdeDossier";

function LeverageLine({ p, i, n, line }: Readonly<{ p: MotionValue<number>; i: number; n: number; line: string }>) {
  const step = 1 / n;
  const a = i * step;
  const opacity = useTransform(p, [a - step * 0.5, a + step * 0.35], [0.2, 1], { clamp: true });
  return (
    <motion.li className="flex gap-3" style={{ opacity }}>
      <span className="mt-[3px] font-mono text-[10px] tabular-nums" style={{ color: GREEN }}>{String(i + 1).padStart(2, "0")}</span>
      <span className="text-[12px] leading-[1.4] lg:text-[0.98rem] lg:leading-[1.45]">{line}</span>
    </motion.li>
  );
}

export function LeverageCopy({ p, scene, compact }: Readonly<{ p: MotionValue<number>; scene: DossierScene; compact: boolean }>) {
  return (
    <CopyBlock scene={scene.id} slug={scene.slug} eyebrow={scene.eyebrow} headline={scene.headline} body={compact ? undefined : scene.body} compact={compact} as="div">
      <ul className={compact ? "mt-3 space-y-1.5" : "mt-5 space-y-3"}>
        {leverageItems.map((item, i) => <LeverageLine key={item.id} p={p} i={i} n={leverageItems.length} line={item.line} />)}
      </ul>
    </CopyBlock>
  );
}
