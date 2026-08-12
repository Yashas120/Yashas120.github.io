import type { MotionValue } from "framer-motion";

/** Every /data-plane chapter draws into the shared stage coordinate space. */
export interface ChapterVisualProps {
  /** Local 0→1 mechanism progress for this chapter, derived from scroll. */
  p: MotionValue<number>;
  /** Simplified vertical geometry for narrow viewports. */
  compact: boolean;
}
