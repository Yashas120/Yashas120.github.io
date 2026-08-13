import styles from "./kernel-overview.module.css";

const TEST_MATRIX = [
  "RocksDB workload",
  "CFS · FIFO · ghOSt · Shinjuku-style",
  "Bursty · sustained load",
  "16 · 32 threads",
  "16 GB · 32 GB memory",
] as const;

export function SchedulerExperiment() {
  return (
    <div className={styles.schedulerDemo}>
      <div className={styles.schedulerNotice}>
        Project implementation and test methodology—not a simulated scheduler or benchmark result.
      </div>
      <div className={styles.schedulerPath} aria-label="ghOSt project implementation sequence">
        <div className={styles.queue}>
          <span className={styles.diagramLabel}>01 · Build</span>
          <strong>ghOSt-enabled Linux</strong>
        </div>
        <span className={styles.arrow} aria-hidden="true">→</span>
        <div className={styles.kernelBox}>Configure<br /><small>kernel baselines</small></div>
        <span className={styles.arrow} aria-hidden="true">→</span>
        <div className={styles.policyBox}>Configure<br /><small>user-space policies</small></div>
        <span className={styles.arrow} aria-hidden="true">→</span>
        <div className={styles.observerBox}>Run RocksDB<br /><small>profile + compare</small></div>
      </div>
      <p className={styles.staticEquivalent}>
        The controlled matrix held the workload definition constant while varying {TEST_MATRIX.join(" · ")}.
        Latency and throughput were collected for like-for-like comparisons; unpublished measurements are not reproduced here.
      </p>
    </div>
  );
}
