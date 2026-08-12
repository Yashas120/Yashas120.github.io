/**
 * /devtools — "Inspect the delivery system."
 *
 * A DevOps and platform-engineering portfolio framed as a browser with a docked
 * inspector. The document on the left is the portfolio; the inspector on the right
 * explains the delivery system behind it. The frame is a metaphor, not the
 * information architecture — a visitor never has to decode it to read a role, a
 * result, a project or a contact method.
 *
 * A server component: the whole readable page, including every diagram's text
 * equivalent, is in the exported HTML. The inspector, the mobile sheet and the
 * evidence drawers are the only client code, and each is additive.
 */

import { DevToolsExperience } from "@/components/devops/DevToolsExperience";

export default function DevToolsPage() {
  return <DevToolsExperience />;
}
