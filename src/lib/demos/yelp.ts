// In-browser re-creation of the Yelp restaurant-analysis project: predict whether
// a restaurant stays open or is heading for closure from its features (checkins,
// reviews, rating, amenities), surface which features matter, and show the LDA
// review topics. A logistic-regression model is trained live on a seeded,
// fictionalized sample — no server, no dependencies and no claims about real
// businesses.

export interface Feature {
  key: string;
  label: string;
  kind: "num" | "bool";
  min: number;
  max: number;
  step: number;
  unit?: string;
  // "true" influence on staying OPEN (used only to generate the sample labels)
  w: number;
}

export const FEATURES: Feature[] = [
  { key: "checkins", label: "check-ins / week", kind: "num", min: 0, max: 120, step: 1, w: 1.5 },
  { key: "reviews", label: "review count", kind: "num", min: 3, max: 800, step: 1, w: 0.9 },
  { key: "stars", label: "avg rating", kind: "num", min: 1, max: 5, step: 0.1, unit: "★", w: 1.1 },
  { key: "price", label: "price level", kind: "num", min: 1, max: 4, step: 1, unit: "$", w: 0.2 },
  { key: "reservations", label: "takes reservations", kind: "bool", min: 0, max: 1, step: 1, w: 0.45 },
  { key: "delivery", label: "offers delivery", kind: "bool", min: 0, max: 1, step: 1, w: 0.3 },
  { key: "outdoor", label: "outdoor seating", kind: "bool", min: 0, max: 1, step: 1, w: 0.25 },
  { key: "groups", label: "good for groups", kind: "bool", min: 0, max: 1, step: 1, w: 0.2 },
];
const BIAS_TRUE = 0.35;

// The seeded scenario uses an illustrative coastal map extent. Names, records,
// labels and coordinates must not be interpreted as real business data.
export const CITY_NAME = "Fictional Coast City";
export const CITY_CENTER = { lat: 34.4208, lng: -119.6982 };
export interface Neighborhood {
  name: string;
  lat: number;
  lng: number;
  spread: number; // degrees
}
export const NEIGHBORHOODS: Neighborhood[] = [
  { name: "Central", lat: 34.4228, lng: -119.708, spread: 0.0045 },
  { name: "Harbor", lat: 34.4145, lng: -119.6905, spread: 0.0032 },
  { name: "Bluff", lat: 34.4025, lng: -119.718, spread: 0.005 },
  { name: "North Market", lat: 34.437, lng: -119.7335, spread: 0.006 },
  { name: "East Market", lat: 34.426, lng: -119.685, spread: 0.005 },
];

// Fictional business identities and seeded educational features. `hood` indexes
// into NEIGHBORHOODS; coordinates only distribute markers over the illustration.
export interface Restaurant {
  name: string;
  lat: number;
  lng: number;
  hood: number;
  stars: number;
  reviews: number;
}
export const RESTAURANTS: Restaurant[] = [
  // Downtown / State St
  { name: "Sample Bistro 01", lat: 34.4179, lng: -119.6949, hood: 0, stars: 4.4, reviews: 380 },
  { name: "Sample Cafe 02", lat: 34.4193, lng: -119.7002, hood: 0, stars: 3.9, reviews: 150 },
  { name: "Sample Table 03", lat: 34.4236, lng: -119.7102, hood: 0, stars: 4.5, reviews: 120 },
  { name: "Sample Kitchen 04", lat: 34.423, lng: -119.7096, hood: 0, stars: 4.4, reviews: 160 },
  { name: "Sample Grill 05", lat: 34.4227, lng: -119.7092, hood: 0, stars: 4.4, reviews: 190 },
  { name: "Sample Noodles 06", lat: 34.4221, lng: -119.708, hood: 0, stars: 4.4, reviews: 260 },
  { name: "Sample Pantry 07", lat: 34.4209, lng: -119.7058, hood: 0, stars: 4.4, reviews: 130 },
  { name: "Sample Corner 08", lat: 34.4189, lng: -119.6982, hood: 0, stars: 4.6, reviews: 110 },
  { name: "Sample Bakery 09", lat: 34.4256, lng: -119.7152, hood: 0, stars: 4.3, reviews: 90 },
  { name: "Sample Diner 10", lat: 34.4234, lng: -119.7098, hood: 0, stars: 4.3, reviews: 170 },
  // Funk Zone / waterfront
  { name: "Harbor Sample 11", lat: 34.4144, lng: -119.6905, hood: 1, stars: 4.5, reviews: 240 },
  { name: "Harbor Sample 12", lat: 34.414, lng: -119.6912, hood: 1, stars: 4.4, reviews: 180 },
  { name: "Harbor Sample 13", lat: 34.4146, lng: -119.6906, hood: 1, stars: 4.3, reviews: 140 },
  { name: "Harbor Sample 14", lat: 34.4143, lng: -119.6902, hood: 1, stars: 4.4, reviews: 100 },
  { name: "Harbor Sample 15", lat: 34.4138, lng: -119.6892, hood: 1, stars: 4.3, reviews: 70 },
  { name: "Harbor Sample 16", lat: 34.415, lng: -119.6918, hood: 1, stars: 4.4, reviews: 80 },
  { name: "Harbor Sample 17", lat: 34.4085, lng: -119.6855, hood: 1, stars: 4.3, reviews: 390 },
  { name: "Harbor Sample 18", lat: 34.4046, lng: -119.6905, hood: 1, stars: 4.1, reviews: 420 },
  // The Mesa
  { name: "Bluff Sample 19", lat: 34.4022, lng: -119.715, hood: 2, stars: 4.4, reviews: 120 },
  { name: "Bluff Sample 20", lat: 34.403, lng: -119.7155, hood: 2, stars: 4.1, reviews: 90 },
  { name: "Bluff Sample 21", lat: 34.4003, lng: -119.7405, hood: 2, stars: 4.1, reviews: 310 },
  { name: "Bluff Sample 22", lat: 34.4028, lng: -119.7248, hood: 2, stars: 4.0, reviews: 220 },
  // Upper State
  { name: "North Sample 23", lat: 34.438, lng: -119.735, hood: 3, stars: 4.3, reviews: 110 },
  { name: "North Sample 24", lat: 34.436, lng: -119.732, hood: 3, stars: 4.4, reviews: 60 },
  { name: "North Sample 25", lat: 34.4372, lng: -119.7338, hood: 3, stars: 4.2, reviews: 130 },
  // Eastside / Milpas
  { name: "East Sample 26", lat: 34.4262, lng: -119.6842, hood: 4, stars: 4.2, reviews: 360 },
  { name: "East Sample 27", lat: 34.4266, lng: -119.6846, hood: 4, stars: 4.4, reviews: 480 },
  { name: "East Sample 28", lat: 34.4201, lng: -119.6905, hood: 4, stars: 4.4, reviews: 90 },
  { name: "East Sample 29", lat: 34.423, lng: -119.689, hood: 4, stars: 4.5, reviews: 70 },
];

export type Row = Record<string, number>;
export interface Sample {
  rows: Row[];
  open: number[]; // 1 = open, 0 = closed
  names: string[];
}

export interface LogisticModel {
  w: number[]; // standardized-space weights (feature importance)
  b: number;
  mean: number[];
  std: number[];
  keys: string[];
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function prng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function gauss(rand: () => number): number {
  // Box–Muller
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Generate a realistic sample of restaurants with an open/closed label drawn
// from the "true" logistic weights above.
export function generateSample(seed = 7): Sample {
  const rand = prng(seed);
  const rows: Row[] = [];
  const open: number[] = [];
  const names: string[] = [];
  for (const rest of RESTAURANTS) {
    const r: Row = {
      checkins: Math.round(Math.abs(gauss(rand)) * 28 + rand() * 20),
      reviews: rest.reviews,
      stars: rest.stars,
      price: 1 + Math.floor(rand() * 4),
      reservations: rand() < 0.45 ? 1 : 0,
      delivery: rand() < 0.55 ? 1 : 0,
      outdoor: rand() < 0.4 ? 1 : 0,
      groups: rand() < 0.6 ? 1 : 0,
    };
    // fictional identity and illustrative location; features above are seeded
    r.hood = rest.hood;
    r.lat = rest.lat;
    r.lng = rest.lng;
    rows.push(r);
    names.push(rest.name);
    // standardized-ish contribution using rough scales, then sigmoid + noise
    const z =
      BIAS_TRUE +
      FEATURES.reduce((acc, f) => {
        const v = r[f.key];
        const norm =
          f.key === "checkins" ? (v - 30) / 25 :
          f.key === "reviews" ? (Math.log10(v) - 1.8) / 0.6 :
          f.key === "stars" ? (v - 3.3) / 0.8 :
          f.key === "price" ? (v - 2.5) / 1.1 :
          v - 0.5;
        return acc + f.w * norm;
      }, 0) +
      gauss(rand) * 0.5;
    open.push(sigmoid(z) > 0.5 ? 1 : 0);
  }
  return { rows, open, names };
}

// Fit logistic regression with standardized features (batch gradient descent).
export function trainLogistic(sample: Sample, epochs = 500, lr = 0.3): LogisticModel {
  const keys = FEATURES.map((f) => f.key);
  const n = sample.rows.length;
  const d = keys.length;
  const mean = new Array(d).fill(0);
  const std = new Array(d).fill(0);
  keys.forEach((k, j) => {
    let m = 0;
    for (const r of sample.rows) m += r[k];
    m /= n;
    let v = 0;
    for (const r of sample.rows) v += (r[k] - m) ** 2;
    mean[j] = m;
    std[j] = Math.sqrt(v / n) || 1;
  });
  const X = sample.rows.map((r) => keys.map((k, j) => (r[k] - mean[j]) / std[j]));
  const w = new Array(d).fill(0);
  let b = 0;
  for (let e = 0; e < epochs; e++) {
    const gw = new Array(d).fill(0);
    let gb = 0;
    for (let i = 0; i < n; i++) {
      const p = sigmoid(X[i].reduce((a, xj, j) => a + xj * w[j], b));
      const err = p - sample.open[i];
      for (let j = 0; j < d; j++) gw[j] += err * X[i][j];
      gb += err;
    }
    for (let j = 0; j < d; j++) w[j] -= (lr * gw[j]) / n;
    b -= (lr * gb) / n;
  }
  return { w, b, mean, std, keys };
}

export function standardize(model: LogisticModel, row: Row): number[] {
  return model.keys.map((k, j) => (row[k] - model.mean[j]) / model.std[j]);
}
// Probability the restaurant stays OPEN.
export function predictOpen(model: LogisticModel, row: Row): number {
  const z = standardize(model, row).reduce((a, xj, j) => a + xj * model.w[j], model.b);
  return sigmoid(z);
}
// Per-feature contribution to the log-odds of staying open for a given row.
export function contributions(model: LogisticModel, row: Row): { key: string; value: number }[] {
  const z = standardize(model, row);
  return model.keys.map((k, j) => ({ key: k, value: z[j] * model.w[j] }));
}

export function accuracy(model: LogisticModel, sample: Sample): number {
  let correct = 0;
  sample.rows.forEach((r, i) => {
    if ((predictOpen(model, r) > 0.5 ? 1 : 0) === sample.open[i]) correct++;
  });
  return correct / sample.rows.length;
}

// LDA-style review topics recovered from the reviews corpus, with how strongly
// each topic is associated with a restaurant staying open (from the paper).
export interface Topic {
  name: string;
  words: string[];
  openAssoc: number; // -1 .. 1
}
export const TOPICS: Topic[] = [
  { name: "Food quality", words: ["delicious", "fresh", "flavor", "authentic", "tasty"], openAssoc: 0.82 },
  { name: "Service", words: ["friendly", "staff", "attentive", "slow", "rude"], openAssoc: 0.61 },
  { name: "Ambiance", words: ["cozy", "clean", "decor", "music", "vibe"], openAssoc: 0.44 },
  { name: "Value", words: ["price", "portion", "worth", "cheap", "expensive"], openAssoc: 0.28 },
  { name: "Wait & crowd", words: ["wait", "busy", "reservation", "line", "packed"], openAssoc: 0.15 },
  { name: "Complaints", words: ["cold", "dirty", "wrong", "overpriced", "closed"], openAssoc: -0.73 },
];
