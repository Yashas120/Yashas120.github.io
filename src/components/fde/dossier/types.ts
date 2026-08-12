import type { MotionValue } from "framer-motion";

/** Every dossier scene draws into the shared sheet coordinate space. */
export interface SceneVisualProps {
  /** Local 0→1 mechanism progress for this scene. */
  p: MotionValue<number>;
  /** Simplified geometry for narrow viewports. */
  compact: boolean;
}
