// -----------------------------------------------------------------------------
// Structure-from-Motion demo math.
//
// Everything here is real, dependency-free 3D geometry that runs client-side:
// pinhole projection, the fundamental matrix (derived from the two camera
// matrices), and midpoint ray triangulation. A synthetic scene + known camera
// poses keep it robust and educational, so the reconstruction step recovers the
// original 3D points from nothing but the two sets of 2D features.
// -----------------------------------------------------------------------------

export type Vec3 = [number, number, number];
export type Mat = number[][];

// ------------------------------- vector ops --------------------------------

export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const normalize = (a: Vec3): Vec3 => {
  const n = norm(a) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};

// ------------------------------- matrix ops --------------------------------

export function matMul(A: Mat, B: Mat): Mat {
  const n = A.length;
  const m = B[0].length;
  const k = B.length;
  const out: Mat = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      let s = 0;
      for (let t = 0; t < k; t++) s += A[i][t] * B[t][j];
      out[i][j] = s;
    }
  return out;
}

export function transpose(A: Mat): Mat {
  return A[0].map((_, j) => A.map((row) => row[j]));
}

// Multiply a matrix by a column vector given as a flat array.
export function matVecN(A: Mat, v: number[]): number[] {
  return A.map((row) => row.reduce((s, a, i) => s + a * v[i], 0));
}

export const matVec3 = (A: Mat, v: Vec3): Vec3 => matVecN(A, v) as Vec3;

// 3x3 inverse via adjugate / determinant.
export function inv3(m: Mat): Mat {
  const [a, b, c] = m[0];
  const [d, e, f] = m[1];
  const [g, h, i] = m[2];
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  const id = 1 / det;
  return [
    [A * id, (c * h - b * i) * id, (b * f - c * e) * id],
    [B * id, (a * i - c * g) * id, (c * d - a * f) * id],
    [C * id, (b * g - a * h) * id, (a * e - b * d) * id],
  ];
}

// ------------------------------- camera ------------------------------------

export interface Camera {
  C: Vec3; // camera centre in world space
  R: Mat; // world -> camera rotation (rows are camera x/y/z axes)
  t: Vec3; // translation: Xc = R (Xw - C) = R Xw + t
}

// Build a pinhole camera looking from `C` towards `target` (OpenCV-style axes:
// x right, y down, z forward into the scene).
export function lookAt(C: Vec3, target: Vec3, up: Vec3 = [0, 1, 0]): Camera {
  const f = normalize(sub(target, C)); // forward (+z)
  const r = normalize(cross(f, up)); // right (+x)
  const u = cross(r, f); // true up
  const R: Mat = [r, [-u[0], -u[1], -u[2]], f]; // y points down in image
  const t = matVec3(R, scale(C, -1));
  return { C, R, t };
}

export interface Intrinsics {
  s: number; // focal length in pixels (fx = fy = s)
  cx: number;
  cy: number;
  K: Mat;
}

// Choose a single shared intrinsic matrix that frames every scene point inside
// both image panels with a margin. Using one K for both cameras keeps the
// fundamental matrix and triangulation self-consistent.
export function fitIntrinsics(
  points: Vec3[],
  cams: Camera[],
  W: number,
  H: number,
  margin: number,
): Intrinsics {
  let nxMin = Infinity,
    nxMax = -Infinity,
    nyMin = Infinity,
    nyMax = -Infinity;
  for (const cam of cams)
    for (const P of points) {
      const Xc = matVec3(cam.R, sub(P, cam.C));
      if (Xc[2] <= 0) continue;
      const nx = Xc[0] / Xc[2];
      const ny = Xc[1] / Xc[2];
      nxMin = Math.min(nxMin, nx);
      nxMax = Math.max(nxMax, nx);
      nyMin = Math.min(nyMin, ny);
      nyMax = Math.max(nyMax, ny);
    }
  const sx = (W - 2 * margin) / (nxMax - nxMin || 1);
  const sy = (H - 2 * margin) / (nyMax - nyMin || 1);
  const s = Math.min(sx, sy);
  const cx = margin - s * nxMin;
  const cy = margin - s * nyMin;
  const K: Mat = [
    [s, 0, cx],
    [0, s, cy],
    [0, 0, 1],
  ];
  return { s, cx, cy, K };
}

export interface Pixel {
  x: number;
  y: number;
  z: number; // depth in front of camera
}

export function project(P: Vec3, cam: Camera, K: Intrinsics): Pixel {
  const Xc = matVec3(cam.R, sub(P, cam.C));
  const z = Xc[2];
  return { x: K.s * (Xc[0] / z) + K.cx, y: K.s * (Xc[1] / z) + K.cy, z };
}

// 3x4 projection matrix P = K [R | t].
function projMatrix(cam: Camera, K: Intrinsics): Mat {
  const Rt: Mat = cam.R.map((row, i) => [...row, cam.t[i]]);
  return matMul(K.K, Rt);
}

// Fundamental matrix derived from the two camera matrices:
//   F = [e']_x P' P^+,  with e' = P' C_A  and  P^+ = P^T (P P^T)^-1.
export function fundamental(camA: Camera, camB: Camera, K: Intrinsics): Mat {
  const PA = projMatrix(camA, K);
  const PB = projMatrix(camB, K);
  const ePr = matVecN(PB, [camA.C[0], camA.C[1], camA.C[2], 1]); // epipole in B
  const PAt = transpose(PA); // 4x3
  const PPt = matMul(PA, PAt); // 3x3
  const PAplus = matMul(PAt, inv3(PPt)); // 4x3
  const skew: Mat = [
    [0, -ePr[2], ePr[1]],
    [ePr[2], 0, -ePr[0]],
    [-ePr[1], ePr[0], 0],
  ];
  return matMul(matMul(skew, PB), PAplus); // 3x3
}

// Epipolar line l' = F x in image B for a point x=(x,y) in image A.
export function epipolarLine(F: Mat, x: number, y: number): [number, number, number] {
  const l = matVecN(F, [x, y, 1]);
  return [l[0], l[1], l[2]];
}

// Midpoint triangulation: intersect the back-projected rays from both cameras.
export function triangulate(a: Pixel, b: Pixel, camA: Camera, camB: Camera, K: Intrinsics): Vec3 {
  const Kinv = inv3(K.K);
  const dir = (cam: Camera, px: Pixel): Vec3 =>
    normalize(matVec3(transpose(cam.R), matVec3(Kinv, [px.x, px.y, 1])));
  const dA = dir(camA, a);
  const dB = dir(camB, b);
  const w0 = sub(camA.C, camB.C);
  const bb = dot(dA, dB);
  const d = dot(dA, w0);
  const e = dot(dB, w0);
  const denom = 1 - bb * bb || 1e-9;
  const s = (bb * e - d) / denom;
  const tt = (e - bb * d) / denom;
  const pA = add(camA.C, scale(dA, s));
  const pB = add(camB.C, scale(dB, tt));
  return scale(add(pA, pB), 0.5);
}

// ------------------------------- scenes ------------------------------------

export interface ScenePoint {
  p: Vec3;
  color: string;
}

// Rainbow colour by index so a feature keeps the same colour across both views
// (makes correspondences visually trackable) and the cloud reads as structured.
function colorize(pts: Vec3[]): ScenePoint[] {
  const n = pts.length;
  return pts.map((p, i) => ({ p, color: `hsl(${Math.round((i / n) * 300)}, 75%, 60%)` }));
}

function houseScene(): ScenePoint[] {
  const pts: Vec3[] = [];
  const xs = [-1, -0.5, 0, 0.5, 1];
  const ys = [0, 0.4, 0.8, 1.2];
  // front / back walls (z = ±1)
  for (const z of [-1, 1]) for (const x of xs) for (const y of ys) pts.push([x, y, z]);
  // left / right walls (x = ±1)
  for (const x of [-1, 1]) for (const z of [-1, -0.5, 0, 0.5, 1]) for (const y of ys) pts.push([x, y, z]);
  // gable roof: two slopes from eaves (y=1.2) to ridge (x=0, y=1.85)
  for (const z of [-1, -0.5, 0, 0.5, 1])
    for (const t of [0, 0.34, 0.67, 1]) {
      pts.push([-1 + t, 1.2 + t * 0.65, z]);
      pts.push([1 - t, 1.2 + t * 0.65, z]);
    }
  // ground plane
  for (const x of [-1.8, -0.9, 0, 0.9, 1.8]) for (const z of [-1.8, -0.9, 0, 0.9, 1.8]) pts.push([x, 0, z]);
  return colorize(pts);
}

function torusScene(): ScenePoint[] {
  const pts: Vec3[] = [];
  const R = 1.15,
    r = 0.45;
  const U = 20,
    V = 8;
  for (let i = 0; i < U; i++)
    for (let j = 0; j < V; j++) {
      const u = (i / U) * Math.PI * 2;
      const v = (j / V) * Math.PI * 2;
      const rr = R + r * Math.cos(v);
      pts.push([rr * Math.cos(u), r * Math.sin(v) + 0.7, rr * Math.sin(u)]);
    }
  return colorize(pts);
}

export type SceneId = "house" | "torus";

export interface SceneDef {
  id: SceneId;
  label: string;
  points: ScenePoint[];
}

export const SCENES: SceneDef[] = [
  { id: "house", label: "house", points: houseScene() },
  { id: "torus", label: "torus", points: torusScene() },
];

// Two viewpoints of the scene. Shared across scenes (both are centred near the
// origin at a similar scale), matching the "same rig, two shots" story.
export const CAM_A = lookAt([-1.7, 1.35, -4.6], [0, 0.6, 0]);
export const CAM_B = lookAt([1.75, 1.5, -4.2], [0, 0.6, 0]);

// ------------------------------- steps -------------------------------------

export type StepKey = "capture" | "detect" | "match" | "epipolar" | "triangulate" | "cloud";

export interface Step {
  key: StepKey;
  module: string;
  title: string;
  op: string;
  summary: string;
  what: string[];
}

export const STEPS: Step[] = [
  {
    key: "capture",
    module: "Images",
    title: "Capture two views",
    op: "pinhole projection",
    summary:
      "Two photographs of the same rigid scene are taken from slightly different positions. Each 3D point projects to a 2D pixel through a pinhole camera.",
    what: [
      "Same scene, two camera centres with a small baseline between them.",
      "A point X projects to x = K · (R·X + t) in each image.",
      "The parallax between the views is what makes depth recoverable.",
    ],
  },
  {
    key: "detect",
    module: "Detector",
    title: "Detect features",
    op: "keypoints",
    summary:
      "Distinctive, repeatable keypoints (corners, blobs) are found in each image independently — the anchors SfM will reason about.",
    what: [
      "Detectors like SIFT/ORB fire on locally-distinctive patches.",
      "Each keypoint carries a descriptor summarising its neighbourhood.",
      "Only features that survive in both views are useful downstream.",
    ],
  },
  {
    key: "match",
    module: "Matcher",
    title: "Match across views",
    op: "descriptor matching",
    summary:
      "Descriptors are compared between the two images to find the same physical point in both — the 2D↔2D correspondences.",
    what: [
      "Nearest-descriptor matching pairs a feature in A with one in B.",
      "Same colour = same physical point across the two views.",
      "Wrong matches (outliers) are later rejected by the geometry.",
    ],
  },
  {
    key: "epipolar",
    module: "Geometry",
    title: "Epipolar constraint",
    op: "fundamental matrix F",
    summary:
      "The relative pose of the two cameras is captured by the fundamental matrix F. A point in one image must lie on a line — its epipolar line — in the other.",
    what: [
      "For a point x in A, its match in B lies on l′ = F·x.",
      "This 2D constraint filters outliers and recovers relative pose.",
      "All epipolar lines pass through the epipole (the other camera's image).",
    ],
  },
  {
    key: "triangulate",
    module: "Triangulation",
    title: "Triangulate depth",
    op: "ray intersection",
    summary:
      "Each match defines a ray from each camera centre through its pixel. The two rays meet at the 3D point — recovered by intersecting them.",
    what: [
      "Back-project both pixels into world-space rays.",
      "The closest point between the rays is the reconstructed 3D point.",
      "Repeat for every match to build the point cloud.",
    ],
  },
  {
    key: "cloud",
    module: "Model",
    title: "Reconstructed cloud",
    op: "3D point cloud",
    summary:
      "Triangulating every correspondence yields the sparse 3D structure of the scene — the 'structure' recovered from 'motion'. Drag to orbit.",
    what: [
      "Every coloured point was recovered purely from the two 2D views.",
      "Camera markers show the two recovered viewpoints.",
      "Bundle adjustment would jointly refine points and poses next.",
    ],
  },
];
