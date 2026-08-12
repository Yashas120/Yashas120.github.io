import { featuredSystems, hero, proofLinks, type PublicLink, type StoryScene } from "@/lib/clusterContent";
import styles from "./cluster.module.css";

function ProofLink({ link }: Readonly<{ link: PublicLink }>) {
  return (
    <a
      className={styles.proofLink}
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer noopener" : undefined}
      aria-label={`${link.label}${link.detail ? `, ${link.detail}` : ""}${link.external ? " (opens in a new tab)" : ""}`}
    >
      {link.label}
      {link.external && <span aria-hidden="true"> ↗</span>}
    </a>
  );
}

/**
 * The semantic story copy shared by the normal-flow and sticky presentations.
 * CSS changes composition; JavaScript never replaces this tree.
 */
export function SceneStory({ scene, index, headingId }: Readonly<{ scene: StoryScene; index: number; headingId: string }>) {
  const isHero = index === 0;
  const isEvidence = scene.visual === "evidence";
  const isHandoff = scene.visual === "handoff";

  return (
    <div className={styles.copy}>
      <p className={styles.eyebrow}>{scene.eyebrow}</p>
      {isHero ? (
        <h1 id={headingId} className={styles.heroHeading}>{scene.heading}</h1>
      ) : (
        <h2 id={headingId} className={styles.sceneHeading}>{scene.heading}</h2>
      )}

      {isHero && <p className={styles.proof}>{hero.proof}</p>}
      <p className={styles.body}>{scene.body}</p>
      {!isHero && scene.support && <p className={styles.support}>{scene.support}</p>}

      {isHero && (
        <>
          <p className={styles.context}>{hero.context}</p>
          <p className={styles.disclosure}>{hero.disclosure}</p>
          <div className={styles.actions}>
            <a className={styles.buttonPrimary} href="#regional-consequences">
              View production systems
            </a>
            <a className={styles.buttonSecondary} href="#complete-profile">
              View complete profile
            </a>
          </div>
          <div className={styles.proofLinks} aria-label="Profile proof links">
            {proofLinks.map((link) => (
              <ProofLink key={link.href} link={link} />
            ))}
          </div>
        </>
      )}

      {isEvidence ? (
        <ul className={styles.compactEvidence}>
          {featuredSystems.map((item, itemIndex) => (
            <li key={item.name} data-step={String(itemIndex + 1)}>
              <strong>{item.name}</strong> · {item.labels.join(" · ")}. {item.boundary}
            </li>
          ))}
        </ul>
      ) : !isHero ? (
        <ol className={styles.transcript} aria-label={`${scene.heading} mechanism transcript`}>
          {scene.transcript.map((step, stepIndex) => (
            <li key={step} data-step={String(stepIndex + 1)}>
              {step}
            </li>
          ))}
        </ol>
      ) : null}

      {isHandoff && (
        <div className={styles.actions}>
          <a className={styles.buttonPrimary} href="#complete-profile">
            Read the complete profile
          </a>
        </div>
      )}
    </div>
  );
}
