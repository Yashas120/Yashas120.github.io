// Pure logic + metadata for the Parallel Computing Playground (SSP coursework:
// pthreads parallel-pi, OpenMP loop scheduling, cache row/column traversal, and
// a thread race condition). Everything here is dependency-free and runs live.

export interface Mode {
  key: string;
  title: string;
  file: string; // the original source file this mirrors
  op: string;
  summary: string;
  steps: string[]; // the mechanism, step by step
  code: string[]; // trimmed but faithful source from the repo
  focus: number[]; // indices of the code lines that carry the idea
}

export const MODES: Mode[] = [
  {
    key: "pi",
    title: "Parallel π — strided decomposition",
    file: "assign2/parallel_pi.c",
    op: "pthreads · strided work-split + join-reduce",
    summary:
      "π is the area under a unit semicircle. parallel_pi.c slices that area into NUM_RECT midpoint rectangles and hands them to threads in a strided pattern — the implementation trick is how the work is divided and then re-combined, not the number that comes out.",
    steps: [
      "Split: thread t takes rectangles t, t+T, t+2T, … — the loop stride is the thread count (i += NUMTHREADS). No index is computed twice and no lock is needed while summing.",
      "Sum locally: each thread keeps its own partialSum in a register, so the hot loop touches no shared memory.",
      "Join & reduce: main pthread_joins every worker in order and adds its partial into gPi — a serial reduction over T values.",
      "Scale: gPi *= 2 because we only integrated the half-width [−1,1] of y=√(1−x²).",
    ],
    code: [
      "#define NUM_RECT 10000000",
      "#define NUMTHREADS 100",
      "double gPi = 0.0;              // shared, written only in main",
      "",
      "void *Area(void *pArg){",
      "  double *myNum = pArg;        // arg = this thread's id t",
      "  double h = 2.0/NUM_RECT, x, partialSum = 0.0;",
      "  for (int i = *myNum; i < NUM_RECT; i += NUMTHREADS){  // STRIDE",
      "    x = -1 + (i + 0.5)*h;",
      "    partialSum += sqrt(1.0 - x*x) * h;   // midpoint area",
      "  }",
      "  *myNum = partialSum;         // hand the partial back",
      "}",
      "",
      "int main(){",
      "  for (i=0;i<NUMTHREADS;i++)",
      "    pthread_create(&h[i],0,Area,&tNum[i]);",
      "  for (i=0;i<NUMTHREADS;i++){",
      "    pthread_join(h[i],0); gPi += tNum[i];  // REDUCE",
      "  }",
      "  gPi *= 2.0;                  // → π",
      "}",
    ],
    focus: [7, 9, 18, 20],
  },
  {
    key: "race",
    title: "Race condition — a non-atomic reduction",
    file: "assign2/parallel_pi.c · gLock",
    op: "read-modify-write · lost updates",
    summary:
      "parallel_pi.c declares a mutex gLock and leaves it commented out — safe only because each thread writes its own slot. This lesson asks the follow-up: what if threads reduced straight into gPi? gPi += partial is not one instruction, so two threads can clobber each other.",
    steps: [
      "gPi += partial compiles to three steps: LOAD gPi into a register, ADD partial, STORE back.",
      "If thread B LOADs before thread A STOREs, both start from the same old value and B's write erases A's — a lost update.",
      "pthread_mutex_lock(&gLock) around the three steps makes them atomic: B waits until A unlocks, so every update lands.",
      "The cost is serialisation — the point of keeping the hot loop lock-free and only locking the tiny reduction.",
    ],
    code: [
      "double gPi = 0.0;",
      "pthread_mutex_t gLock;",
      "",
      "void *Area(void *pArg){",
      "  double partial = integrate_my_stripe();",
      "",
      "  // the reduction — safe only if serialised:",
      "  pthread_mutex_lock(&gLock);   // ← comment out to race",
      "    gPi = gPi + partial;        // LOAD gPi | ADD | STORE gPi",
      "  pthread_mutex_unlock(&gLock);",
      "  return 0;",
      "}",
    ],
    focus: [7, 8, 9],
  },
  {
    key: "cache",
    title: "Cache locality — how the walk hits memory",
    file: "assign4/2d_row.c vs 2d_col.c",
    op: "spatial locality · cache lines",
    summary:
      "Two files zero the same N×N matrix; the only difference is arr[row][col] vs arr[col][row]. Same result, wildly different runtime — because the index order decides whether consecutive accesses land in the same cache line or jump to a new memory block every step.",
    steps: [
      "The matrix is int** — an array of row pointers, each to its own malloc'd block. arr[i][j] for consecutive j walks one block sequentially.",
      "The first access to a block misses and pulls in a whole cache line (~16 ints); the next few j's are hits — that's the payoff of locality.",
      "arr[col][row] makes the FIRST index change fastest, so every step jumps to a different block — a fresh miss almost every time.",
      "Same instructions, same result; the fast version just respects how memory is laid out.",
    ],
    code: [
      "int** arr = malloc(n*sizeof(int*));",
      "for (i=0;i<n;i++) arr[i] = malloc(n*sizeof(int)); // n blocks",
      "",
      "for (int row=0; row<n; row++)",
      "  for (int col=0; col<n; col++)",
      "    arr[row][col] = 0;   // FAST: sequential within a block",
      "    // arr[col][row] = 0; // SLOW: new block every step",
    ],
    focus: [3, 4, 5, 6],
  },
];

// --- parallel π (midpoint rule on the unit semicircle) ---------------------
export function semicircleY(x: number): number {
  return Math.sqrt(Math.max(0, 1 - x * x));
}
// Midpoint-rule contribution of rectangle i (matches parallel_pi.c indexing).
export function rectContribution(i: number, nRect: number): { x: number; area: number } {
  const h = 2.0 / nRect;
  const x = -1 + (i + 0.5) * h;
  return { x, area: semicircleY(x) * h };
}
export function piMidpoint(nRect: number): number {
  let s = 0;
  for (let i = 0; i < nRect; i++) s += rectContribution(i, nRect).area;
  return 2 * s;
}

// A simple, honest performance model: serial cost ∝ work; parallel adds a
// per-thread spawn/join overhead and can't beat the slowest thread's share.
export function speedupModel(work: number, threads: number, overheadPerThread = 0.04): number {
  const serial = work;
  const parallel = work / threads + overheadPerThread * threads;
  return serial / parallel;
}

// --- OpenMP-style loop scheduling ------------------------------------------
export type ScheduleKind = "static" | "cyclic" | "dynamic" | "guided";
export interface Assignment {
  thread: number;
  iter: number;
  cost: number;
  start: number; // cumulative start time on that thread
  end: number;
}
// Assign iterations (with per-iter costs) to `threads` workers under a schedule.
export function scheduleIterations(
  costs: number[],
  threads: number,
  kind: ScheduleKind,
  chunk = 1,
): { assignments: Assignment[]; makespan: number; perThread: number[] } {
  const n = costs.length;
  const busy = new Array(threads).fill(0); // current end time per thread
  const assignments: Assignment[] = [];
  const place = (iter: number, thread: number) => {
    const start = busy[thread];
    const end = start + costs[iter];
    busy[thread] = end;
    assignments.push({ thread, iter, cost: costs[iter], start, end });
  };

  if (kind === "static") {
    const per = Math.ceil(n / threads);
    for (let i = 0; i < n; i++) place(i, Math.min(threads - 1, Math.floor(i / per)));
  } else if (kind === "cyclic") {
    for (let i = 0; i < n; i++) place(i, i % threads);
  } else if (kind === "dynamic") {
    // greedy: next chunk goes to the currently-least-loaded thread
    let i = 0;
    while (i < n) {
      const t = busy.indexOf(Math.min(...busy));
      for (let c = 0; c < chunk && i < n; c++, i++) place(i, t);
    }
  } else {
    // guided: shrinking chunks to the least-loaded thread
    let i = 0;
    while (i < n) {
      const t = busy.indexOf(Math.min(...busy));
      const remaining = n - i;
      const cs = Math.max(1, Math.floor(remaining / (2 * threads)));
      for (let c = 0; c < cs && i < n; c++, i++) place(i, t);
    }
  }
  const makespan = Math.max(...busy);
  return { assignments, makespan, perThread: busy };
}

// --- race condition simulation ---------------------------------------------
// Simulate T threads each incrementing a shared counter `iters` times. Without
// a lock we model interleaving: with some probability a thread's read-modify-
// write overlaps another's, losing an update. With a lock, every update lands.
export function simulateRace(
  threads: number,
  iters: number,
  locked: boolean,
  collisionProb: number,
  rand: () => number,
): { final: number; expected: number; lost: number } {
  const expected = threads * iters;
  if (locked) return { final: expected, expected, lost: 0 };
  let counter = 0;
  let lost = 0;
  // interleave all operations; each increment may be clobbered by an overlap
  const totalOps = expected;
  for (let k = 0; k < totalOps; k++) {
    if (threads > 1 && rand() < collisionProb) {
      lost++; // this increment is lost to a concurrent write
    } else {
      counter++;
    }
  }
  return { final: counter, expected, lost };
}

// deterministic PRNG for reproducible race runs
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- cache traversal model --------------------------------------------------
// Row-major vs column-major sum of an N×N matrix with a cache line of L elems.
export function cacheStats(n: number, line: number, columnMajor: boolean): { hits: number; misses: number } {
  // Model a single cache line's worth of locality. Row-major: consecutive j
  // share a line (L-1 hits per miss). Column-major: each step jumps a row, so
  // (almost) every access misses unless the whole row fits repeatedly.
  const total = n * n;
  let misses: number;
  if (!columnMajor) {
    misses = Math.ceil(total / line);
  } else {
    // a line covers `line` consecutive elements of one row; visiting down a
    // column touches a new line each time until we wrap back within reuse dist.
    misses = total; // worst case, one miss per access for large n
  }
  return { hits: total - misses, misses };
}
