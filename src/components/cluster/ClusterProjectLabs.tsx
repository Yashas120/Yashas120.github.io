import { ProjectDemoPresentation } from "@/components/demos/ProjectDemoPresentation";
import styles from "./cluster.module.css";

const clusterTheme = {
  accent: "#ff6b35",
  surface: "#111824",
  border: "rgba(255, 107, 53, 0.3)",
  text: "#f8f6f1",
  muted: "#b8bdc8",
  label: "Distributed mechanism · resolved evidence",
};

const streaming = ["producer", "socket ingestion", "micro-batches", "executor fan-out", "model update"];
const provisioning = ["VM request", "quota checks", "allocation candidates", "commit / reject"];

export function ClusterProjectLabs() {
  return (
    <section id="cluster-project-labs" className={styles.projectLabs} aria-labelledby="cluster-project-labs-title">
      <div className={styles.projectLabsInner}>
        <header className={styles.projectLabsIntro}>
          <p className={styles.sectionEyebrow}>Public project mechanisms</p>
          <h2 id="cluster-project-labs-title" className={styles.sectionHeading}>From distributed flow to inspectable proof.</h2>
          <p className={styles.sectionIntro}>The production film remains employer evidence. These exact public projects now resolve their modeled topology before handing control to a real browser lab.</p>
        </header>

        <Mechanism title="Streaming classification flow" steps={streaming} />
        <ProjectDemoPresentation demoId="cifar" theme={clusterTheme} autoOpen eyebrow="Micro-batch update · resolved" />

        <Mechanism title="Database allocation flow" steps={provisioning} />
        <ProjectDemoPresentation demoId="cloud" theme={clusterTheme} autoOpen eyebrow="Allocation decision · resolved" />

        <aside className={styles.noDemoNote}>
          <strong>ghOSt scheduler evidence</strong>
          <span>Repository and experimental evidence only. It is not mapped to the Parallel Computing playground.</span>
        </aside>
      </div>
    </section>
  );
}

function Mechanism({ title, steps }: Readonly<{ title: string; steps: readonly string[] }>) {
  return (
    <figure className={styles.projectMechanism}>
      <figcaption>{title}</figcaption>
      <ol aria-label={`${title} resolved sequence`}>
        {steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}
      </ol>
    </figure>
  );
}
