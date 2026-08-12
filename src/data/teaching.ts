export interface Lab {
  id: string;
  title: string;
  blurb: string;
  lang: "matlab" | "python";
  code: string[];
  output: string;
}

export interface KaggleComp {
  url: string;
  title: string;
  host: string;
  desc: string;
  teams: string;
  participants: string;
  built: string[];
  format: string[];
}

export interface Course {
  id: string;
  name: string;
  code?: string;
  instructor: string;
  term: string;
  students?: string;
  level?: string; // e.g. "graduate course"
  approach: string;
  summary: string;
  stats?: { label: string; value: string }[];
  labs: Lab[];
  kaggle?: KaggleComp;
}

// Teaching-forward summary for the TA page, matching the UCSD TA CV's teaching profile.
export const teachingSummary =
  "Prior TA for Image Processing & Computer Vision, Data Analytics, and the graduate Deep Learning Theory & Practices course at PES University — supporting 656 learners. I designed assignments, labs, answer keys, solution notebooks, and instructional recap videos, and built grading and autograding workflows. I also bring roughly three years of production software engineering at Cisco and two peer-reviewed publications.";

export const teachingStats = {
  courses: 3,
  students: "656",
  submissions: "~740",
  terms: "2022–2023",
  note: "TA at PES University across three CSE courses (656 learners) — I designed labs, answer keys and recap videos, ran office hours, and built grading and autograding workflows.",
};

export const courses: Course[] = [
  {
    id: "ipcv",
    name: "Image Processing & Computer Vision",
    instructor: "Prof. Gowri Srinivasa",
    term: "Dec 2022 – May 2023",
    students: "122 students",
    approach: "Make it tactile. I authored MATLAB labs where the theory produced a picture you could see — including a lab where answers were hidden with classic LSB steganography so students had to actually apply the techniques to reveal them.",
    summary: "Designed a steganography assignment, a hands-on lab, unit materials, and a full answer key (sampling, intensity transforms, histogram eq, ROI masking, LSB watermarking).",
    stats: [
      { label: "graded", value: "~250 submissions in 1 week" },
      { label: "office hours", value: "5 × 2-hour sessions" },
      { label: "questions answered", value: "~50" },
    ],
    labs: [
      {
        id: "lsb",
        title: "LSB Steganography — hide the answer in the image",
        blurb: "The classic (most basic) steganography technique: overwrite the least-significant bit-plane so the payload is invisible to the eye. Students recover a hidden PES logo from bit-plane 1 — the 'answer key' lives inside the picture.",
        lang: "matlab",
        code: [
          "im_gray  = rgb2gray(imread('horse.jpg'));",
          "im_hidden = im2bw(imread('PESLogo.jpg'));",
          "% clear the LSB, then embed the hidden bit-plane",
          "im_no_lsb = double(im_gray - mod(im_gray, 2));",
          "watermarked = uint8(im_no_lsb + double(im_hidden));",
          "% recover: read back bit-plane 1",
          "recovered = bitget(watermarked, 1);",
          "imshow(logical(recovered));",
        ],
        output: "Bit-plane 1 reveals the hidden PES logo — invisible in the carrier image, exact on extraction.",
      },
      {
        id: "histeq",
        title: "Histogram Equalization",
        blurb: "Show how redistributing intensities stretches contrast — side by side with the histograms.",
        lang: "matlab",
        code: [
          "im   = imread('1.jpg');",
          "im_eq = histeq(im);",
          "subplot(1,4,1), imshow(im),    title('Original');",
          "subplot(1,4,2), imhist(im);",
          "subplot(1,4,3), imshow(im_eq), title('Equalized');",
          "subplot(1,4,4), imhist(im_eq);",
        ],
        output: "Flattened histogram → visibly higher contrast. The math becomes obvious once you see both histograms.",
      },
      {
        id: "machband",
        title: "The Mach Band Illusion",
        blurb: "A perception lab: uniform bands look gradient-shaded at the edges. Great for teaching that vision != pixels.",
        lang: "matlab",
        code: [
          "num_bands = 4; width = 256/num_bands;",
          "% build uniform intensity bands",
          "I = build_bands(num_bands, width);",
          "% average across boundaries to expose the illusion",
          "I = smooth_boundaries(I, num_bands);",
          "imshow(I, []), title('Mach band');",
        ],
        output: "Perfectly flat bands appear to darken/brighten near edges — human contrast perception, not the data.",
      },
      {
        id: "sampling",
        title: "Spatial Sampling & Aliasing",
        blurb: "Undersample an image and watch detail alias into blocky artifacts — the sampling theorem, made visible.",
        lang: "matlab",
        code: [
          "cm = imread('cameraman.tif');",
          "interval = 8;   % pick every Nth pixel",
          "im = zeros(size(cm));",
          "for i = 1:interval:size(cm,1)",
          "  for j = 1:interval:size(cm,2)",
          "    im(i:i+interval-1, j:j+interval-1) = cm(i,j);",
          "  end",
          "end",
          "imshow(uint8(im)), title('Sampled Image');",
        ],
        output: "As the sampling interval grows, high-frequency detail aliases — a hands-on view of Nyquist.",
      },
    ],
  },
  {
    id: "da",
    name: "Data Analytics",
    code: "UE20CS312",
    instructor: "Prof. Gowri Srinivasa",
    term: "Aug 2022 – Dec 2022",
    students: "494 students",
    approach: "Make it fun. I wrote TV-show-themed worksheets (Brooklyn Nine-Nine's 99th precinct) so students learned Markov chains and A/B testing through a story, and I ran office hours + class forums to keep help accessible.",
    summary: "Authored the themed assignment + answer key/solution notebook + recap videos, and hosted a public Kaggle team competition with an automated grader.",
    stats: [
      { label: "graded", value: "~370 submissions in 1 week" },
      { label: "Kaggle competition", value: "178 teams · 494 participants" },
      { label: "office hours", value: "6 × 2-hour + forums" },
      { label: "questions answered", value: "~150" },
    ],
    kaggle: {
      url: "https://www.kaggle.com/competitions/data-analytics-ue20cs312",
      title: "Data Analytics (UE20CS312) — Kaggle in-class competition",
      host: "Designed & administered as TA · PES University, Fall 2022",
      desc: "I turned a course topic into a hands-on prediction competition so students learned the full modeling loop — cleaning, feature engineering, model selection, and validation against a hidden test set.",
      teams: "178 teams",
      participants: "494 participants",
      built: [
        "Framed the prediction task and prepared the dataset with a held-out train/test split",
        "Defined the evaluation metric and the public/private leaderboard so scores couldn't be gamed",
        "Wrote the automated grader that scored 178 teams (494 participants) and returned consistent rankings within a day",
      ],
      format: ["Team competition", "Public / private split", "Held-out test set", "Automated grading"],
    },
    labs: [
      {
        id: "markov",
        title: "Worksheet 5 — Markov Chains & A/B Testing (the 99th precinct)",
        blurb: "Captain Holt adds a feedback unit; students model where citizens report crimes over N days using transition matrices and absorbing states.",
        lang: "python",
        code: [
          "import numpy as np",
          "# transition matrix for the 5 precinct units",
          "P = np.array([",
          "  [0.002, 0.666, 0.31, 0.0,   0.022],",
          "  [0.466, 0.102, 0.222,0.0,   0.21 ],",
          "  [0.022, 0.11,  0.502,0.0,   0.366],",
          "  [0.0,   0.0,   0.0,  1.0,   0.0  ],",
          "  [0.11,  0.122, 0.066,0.0,   0.702]])",
          "assert np.allclose(P.sum(axis=1), 1)",
          "# distribution after N days via Chapman-Kolmogorov",
          "state = np.linalg.matrix_power(P, 1000)[0]",
        ],
        output: "Students derive the stationary distribution and reason about irreducibility and absorbing states — wrapped in a story they remember.",
      },
    ],
  },
  {
    id: "dl",
    name: "Deep Learning Theory & Practices",
    instructor: "Prof. Preet Kanwal & Prof. Uma P",
    term: "Jul 2022 – Dec 2022",
    students: "~40 students",
    level: "graduate course · selected as an undergraduate TA",
    approach: "Build from primitives. Rather than call a one-liner, students implement the Encoder and Decoder as custom Keras layers so they understand the forward pass and reconstruction loss.",
    summary: "Selected as an undergrad TA for this graduate course; authored 3 assignments, labs, and materials on autoencoders & GANs, and built a web submission + autograding workflow with instant validation.",
    stats: [
      { label: "assignments authored", value: "3 (+ autograder)" },
      { label: "office hours", value: "2 dedicated sessions" },
      { label: "feedback", value: "instant autograded validation" },
    ],
    labs: [
      {
        id: "autoencoder",
        title: "Autoencoder in TensorFlow (MNIST)",
        blurb: "A hand-built encoder/decoder that compresses 784→64→784 and reconstructs handwritten digits.",
        lang: "python",
        code: [
          "class Encoder(tf.keras.layers.Layer):",
          "    def __init__(self, dim):",
          "        super().__init__()",
          "        self.hidden = tf.keras.layers.Dense(dim, activation='relu')",
          "        self.out    = tf.keras.layers.Dense(dim, activation='sigmoid')",
          "    def call(self, x):",
          "        return self.out(self.hidden(x))",
          "",
          "ae = Autoencoder(intermediate_dim=64, original_dim=784)",
          "ae.compile(optimizer='adam', loss='mse')",
        ],
        output: "Students watch reconstruction loss fall and see blurry-then-sharp MNIST digits rebuilt from a 64-D bottleneck.",
      },
    ],
  },
];
