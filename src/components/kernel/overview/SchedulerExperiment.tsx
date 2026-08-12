"use client";

import { useMemo, useState } from "react";
import styles from "./kernel-overview.module.css";

const fields = {
  workload: ["RocksDB", "Backend server"],
  load: ["Bursty", "Sustained"],
  threads: ["16 threads", "32 threads"],
  memory: ["16 GB", "32 GB"],
} as const;

export function SchedulerExperiment() {
  const [workload, setWorkload] = useState<(typeof fields.workload)[number]>("RocksDB");
  const [load, setLoad] = useState<(typeof fields.load)[number]>("Bursty");
  const [threads, setThreads] = useState<(typeof fields.threads)[number]>("16 threads");
  const [memory, setMemory] = useState<(typeof fields.memory)[number]>("16 GB");

  const taskCount = threads === "16 threads" ? 4 : 7;
  const tasks = useMemo(() => Array.from({ length: taskCount }, (_, index) => `T${index + 1}`), [taskCount]);

  return (
    <div className={styles.schedulerDemo}>
      <div className={styles.schedulerNotice}>
        Conceptual visualization of the experiment architecture—not measured output.
      </div>
      <div className={styles.schedulerControls}>
        <Select label="Workload" value={workload} options={fields.workload} onChange={setWorkload} />
        <Select label="Load pattern" value={load} options={fields.load} onChange={setLoad} />
        <Select label="Concurrency" value={threads} options={fields.threads} onChange={setThreads} />
        <Select label="Memory" value={memory} options={fields.memory} onChange={setMemory} />
      </div>
      <div className={styles.schedulerPath} aria-hidden="true">
        <div className={styles.queue}>
          <span className={styles.diagramLabel}>{workload} · {load}</span>
          <div className={styles.tasks}>{tasks.map((task) => <i key={task}>{task}</i>)}</div>
        </div>
        <span className={styles.arrow}>→</span>
        <div className={styles.kernelBox}>Kernel<br /><small>mechanism</small></div>
        <span className={`${styles.arrow} ${styles.bidirectional}`}>⇄</span>
        <div className={styles.policyBox}>User space<br /><small>policy</small></div>
        <span className={styles.arrow}>→</span>
        <div className={styles.observerBox}>Record<br /><small>{threads} · {memory}</small></div>
      </div>
      <p className={styles.staticEquivalent}>
        The selected {workload} workload under a {load.toLowerCase()} load creates runnable tasks.
        Kernel mechanisms exchange scheduling decisions with a user-space policy, dispatch a task,
        and record behavior for the {threads.toLowerCase()}, {memory} configuration. The controls
        change the architecture illustration only; they do not generate performance results.
      </p>
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: Readonly<{ label: string; value: T; options: readonly T[]; onChange: (value: T) => void }>) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
