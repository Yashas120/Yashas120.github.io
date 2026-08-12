// -----------------------------------------------------------------------------
// CIFAR-10 streaming-classifier demo.
//
// A real, dependency-free multinomial logistic-regression (softmax) classifier
// trained live in the browser via mini-batch SGD. It mirrors the Spark project's
// analysis: images arrive as a stream of micro-batches and we watch test
// accuracy climb, with the micro-batch size as the knob that shapes convergence.
// Features are average-pooled pixels from the real CIFAR-10 thumbnails; nothing
// is precomputed on a server.
// -----------------------------------------------------------------------------

export const CIFAR_CLASSES = [
  "airplane",
  "automobile",
  "bird",
  "cat",
  "deer",
  "dog",
  "frog",
  "horse",
  "ship",
  "truck",
] as const;

// Distinct hue per class, used to colour the flowing tokens in the dataflow view.
export const CLASS_COLORS = [
  "#60a5fa", // airplane
  "#f472b6", // automobile
  "#34d399", // bird
  "#fbbf24", // cat
  "#a78bfa", // deer
  "#f87171", // dog
  "#22d3ee", // frog
  "#fb923c", // horse
  "#4ade80", // ship
  "#c084fc", // truck
] as const;

export interface CifarMeta {
  cols: number;
  rows: number;
  tile: number; // native tile size (32)
  count: number;
  perClass: number;
  labels: number[]; // class index per tile, in row-major sprite order
  classes: string[];
}

// Average-pool a `tile`×`tile` RGBA patch down by `factor` and return normalised
// [0,1] RGB features. Pooling denoises and shrinks the model (16×16×3 = 768).
export function poolFeatures(rgba: Uint8ClampedArray, tile: number, factor: number): Float32Array {
  const out = tile / factor;
  const f = new Float32Array(out * out * 3);
  const inv = 1 / (factor * factor * 255);
  for (let oy = 0; oy < out; oy++) {
    for (let ox = 0; ox < out; ox++) {
      let r = 0,
        g = 0,
        b = 0;
      for (let dy = 0; dy < factor; dy++) {
        for (let dx = 0; dx < factor; dx++) {
          const px = ((oy * factor + dy) * tile + (ox * factor + dx)) * 4;
          r += rgba[px];
          g += rgba[px + 1];
          b += rgba[px + 2];
        }
      }
      const o = (oy * out + ox) * 3;
      f[o] = r * inv;
      f[o + 1] = g * inv;
      f[o + 2] = b * inv;
    }
  }
  return f;
}

// Per-feature standardisation fit on the training split — critical for SGD to
// converge quickly on raw-ish pixel features.
export class Standardizer {
  mean: Float32Array;
  std: Float32Array;
  constructor(dim: number) {
    this.mean = new Float32Array(dim);
    this.std = new Float32Array(dim).fill(1);
  }
  fit(rows: Float32Array[]) {
    const d = this.mean.length;
    const n = rows.length || 1;
    this.mean.fill(0);
    for (const r of rows) for (let j = 0; j < d; j++) this.mean[j] += r[j];
    for (let j = 0; j < d; j++) this.mean[j] /= n;
    const varr = new Float32Array(d);
    for (const r of rows)
      for (let j = 0; j < d; j++) {
        const diff = r[j] - this.mean[j];
        varr[j] += diff * diff;
      }
    for (let j = 0; j < d; j++) this.std[j] = Math.sqrt(varr[j] / n) || 1;
  }
  // Standardise and append a bias term -> length dim+1.
  transform(r: Float32Array): Float32Array {
    const d = this.mean.length;
    const out = new Float32Array(d + 1);
    for (let j = 0; j < d; j++) out[j] = (r[j] - this.mean[j]) / this.std[j];
    out[d] = 1; // bias
    return out;
  }
}

export interface EvalResult {
  acc: number;
  confusion: number[][]; // [true][pred]
}

// Multinomial logistic regression trained with mini-batch SGD.
export class Softmax {
  d: number; // feature dim (incl. bias)
  k: number; // classes
  lr: number;
  l2: number;
  W: Float32Array; // k*d
  constructor(d: number, k: number, lr = 0.15, l2 = 1e-4) {
    this.d = d;
    this.k = k;
    this.lr = lr;
    this.l2 = l2;
    this.W = new Float32Array(k * d);
  }
  reset() {
    this.W.fill(0);
  }
  probs(x: Float32Array): Float32Array {
    const { d, k, W } = this;
    const logits = new Float32Array(k);
    let max = -Infinity;
    for (let c = 0; c < k; c++) {
      let s = 0;
      const off = c * d;
      for (let j = 0; j < d; j++) s += W[off + j] * x[j];
      logits[c] = s;
      if (s > max) max = s;
    }
    let sum = 0;
    for (let c = 0; c < k; c++) {
      logits[c] = Math.exp(logits[c] - max);
      sum += logits[c];
    }
    for (let c = 0; c < k; c++) logits[c] /= sum;
    return logits;
  }
  predict(x: Float32Array): number {
    const p = this.probs(x);
    let best = 0;
    for (let c = 1; c < this.k; c++) if (p[c] > p[best]) best = c;
    return best;
  }
  // One SGD step over a mini-batch. Returns mean cross-entropy loss.
  trainBatch(xs: Float32Array[], ys: number[]): number {
    const { d, k, W, lr, l2 } = this;
    const grad = new Float32Array(k * d);
    let loss = 0;
    const n = xs.length;
    for (let i = 0; i < n; i++) {
      const x = xs[i];
      const y = ys[i];
      const p = this.probs(x);
      loss += -Math.log(Math.max(p[y], 1e-9));
      for (let c = 0; c < k; c++) {
        const g = p[c] - (c === y ? 1 : 0);
        const off = c * d;
        for (let j = 0; j < d; j++) grad[off + j] += g * x[j];
      }
    }
    const scale = lr / n;
    for (let idx = 0; idx < W.length; idx++) W[idx] -= scale * grad[idx] + lr * l2 * W[idx];
    return loss / n;
  }
  evaluate(xs: Float32Array[], ys: number[]): EvalResult {
    const conf: number[][] = Array.from({ length: this.k }, () => new Array(this.k).fill(0));
    let correct = 0;
    for (let i = 0; i < xs.length; i++) {
      const pred = this.predict(xs[i]);
      conf[ys[i]][pred]++;
      if (pred === ys[i]) correct++;
    }
    return { acc: xs.length ? correct / xs.length : 0, confusion: conf };
  }
}

// The Spark streaming pipeline stages, for the diagram / narration. These mirror
// the real project: stream.py pushes CIFAR batches over a TCP socket, a Spark
// StreamingContext ingests them at a fixed batch interval as a DStream, each
// micro-batch is an RDD partitioned across executors, mapped to features,
// gradients are reduced on the driver into one SGD step, then evaluated.
export interface Stage {
  key: string;
  label: string;
  desc: string;
}
export const STAGES: Stage[] = [
  { key: "producer", label: "producer", desc: "stream.py pushes batches over TCP :6100" },
  { key: "dstream", label: "DStream", desc: "batch interval → discretized RDD" },
  { key: "partition", label: "partitions", desc: "RDD split across N executors" },
  { key: "map", label: "map · featurize", desc: "pool 16×16 + standardise, in parallel" },
  { key: "reduce", label: "reduce · SGD", desc: "aggregate ∇ on driver, one step" },
  { key: "evaluate", label: "evaluate", desc: "accuracy on held-out test set" },
];

// A guided, one-concept-at-a-time walkthrough of how the streaming classifier is
// built — mirrors the Multiview demo's teaching style. Each step has a short
// title, a code-flavoured op label, a one-line summary, and a few "what happens"
// bullets. The visualization on the right is driven by `key`.
export interface WalkStep {
  key: string;
  module: string; // where in the system: stream.py / StreamingContext / RDD / map() / driver / evaluate
  title: string;
  op: string; // short code-ish label
  summary: string;
  what: string[];
}
export const STEPS: WalkStep[] = [
  {
    key: "producer",
    module: "stream.py",
    title: "Stream the dataset",
    op: "socket.send(batch)",
    summary:
      "A producer reads CIFAR-10 and pushes it over a TCP socket in fixed-size batches — Spark never sees the whole dataset at once.",
    what: [
      "stream.py slices the training set into batches (the micro-batch size) and sends each over TCP :6100.",
      "A sleep interval between batches sets the arrival rate, emulating an unbounded stream.",
      "endless replay keeps fresh mini-batches flowing so training never starves.",
    ],
  },
  {
    key: "dstream",
    module: "StreamingContext",
    title: "Discretize into a DStream",
    op: "ssc.socketTextStream",
    summary:
      "Spark Streaming buffers the socket for one batch interval and emits everything that arrived as a single RDD. That timed series of RDDs is a DStream.",
    what: [
      "Every batch interval, the records that arrived become one RDD — a micro-batch.",
      "A DStream is just that discretized sequence of RDDs over time.",
      "Batch interval and producer rate together decide how many images land in each RDD.",
    ],
  },
  {
    key: "partition",
    module: "RDD",
    title: "Partition across executors",
    op: "rdd.mapPartitions",
    summary:
      "The micro-batch RDD is split into partitions — one chunk per executor — so featurization and gradients run in parallel.",
    what: [
      "Each executor owns a partition and processes its (image, label) pairs independently.",
      "More executors means more parallelism for the same total work.",
      "This is where Spark's distributed execution actually happens.",
    ],
  },
  {
    key: "map",
    module: "map()",
    title: "Featurize each image",
    op: "pool → standardize",
    summary:
      "Inside every partition each 32×32 image is average-pooled to 16×16, flattened to RGB and standardized — a 16×16×3 = 768-d vector (+ bias).",
    what: [
      "Average pooling denoises and shrinks the input 4× before the model sees it.",
      "Per-feature standardization (fit on the train split) keeps SGD well-conditioned.",
      "A pure map: one image in, one feature vector out — no cross-record state.",
    ],
  },
  {
    key: "reduce",
    module: "driver",
    title: "Reduce gradients → SGD step",
    op: "treeAggregate(∇)",
    summary:
      "Each partition computes the softmax cross-entropy gradient for its rows; the driver sums them and applies one SGD update to the weight matrix W (10×769).",
    what: [
      "Multinomial logistic regression: a softmax over 10 class scores.",
      "Partial gradients are reduced on the driver, then W ← W − lr·∇.",
      "One micro-batch = one gradient step, so batch size shapes every update.",
    ],
  },
  {
    key: "evaluate",
    module: "evaluate",
    title: "Score & repeat",
    op: "acc on held-out test",
    summary:
      "After every batch the updated model is scored on a held-out test split. Watch accuracy climb over the stream — and how micro-batch size changes the curve.",
    what: [
      "Accuracy and a confusion matrix refresh each micro-batch.",
      "Smaller batches: noisier, faster early gains; larger: smoother, steadier.",
      "A linear model on pooled pixels plateaus below deep nets — the point is the streaming dynamics.",
    ],
  },
];

// Deterministic Fisher–Yates shuffle so runs are reproducible across reloads.
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
