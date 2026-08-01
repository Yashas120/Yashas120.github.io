export interface CourseEquiv {
  pes: string;
  ucsd: string;
  ucsdTitle: string;
  grade: string; // US letter
  gpa: number; // US 4.0
  taught?: boolean; // Yashas was a TA for this subject
  approx?: boolean; // closest UCSD analogue (no exact 1:1)
}

export interface EquivGroup {
  group: string;
  rows: CourseEquiv[];
}

export const transcriptSummary = {
  usGpa: 3.78,
  credits: 124.5,
  equivalency: "Bachelor of Science in Computer Science & Engineering",
  verifiedBy: "The Evaluation Company (TEC) — a NACES member",
  tecNo: "002586386",
  institution: "PES University, India (2019–2023)",
  scale: "10/S→4.00 (A) · 9/A→3.67 (A−) · 8/B→3.33 (B+)",
};

// PES coursework mapped to the closest UC San Diego CSE/MATH course.
// UCSD titles verified against catalog.ucsd.edu/courses/CSE.html.
export const equivGroups: EquivGroup[] = [
  {
    group: "Core CS & Systems",
    rows: [
      { pes: "Introduction to Computing Using Python", ucsd: "CSE 8A", ucsdTitle: "Introduction to Programming & Computational Problem-Solving I", grade: "A−", gpa: 3.67 },
      { pes: "Problem Solving with C", ucsd: "CSE 30", ucsdTitle: "Computer Organization & Systems Programming", grade: "A−", gpa: 3.67 },
      { pes: "Object Oriented Programming with Java", ucsd: "CSE 11", ucsdTitle: "Introduction to Programming & Computational Problem-Solving", grade: "A", gpa: 4.0 },
      { pes: "Data Structures and Its Applications", ucsd: "CSE 100", ucsdTitle: "Advanced Data Structures", grade: "A−", gpa: 3.67 },
      { pes: "Design and Analysis of Algorithms", ucsd: "CSE 101", ucsdTitle: "Design and Analysis of Algorithms", grade: "A", gpa: 4.0 },
      { pes: "Automata, Formal Languages and Logic", ucsd: "CSE 105", ucsdTitle: "Theory of Computability", grade: "A", gpa: 4.0 },
      { pes: "Digital Design and Computer Organization", ucsd: "CSE 140", ucsdTitle: "Components & Design Techniques for Digital Systems", grade: "A−", gpa: 3.67 },
      { pes: "Microprocessor and Computer Architecture", ucsd: "CSE 141", ucsdTitle: "Introduction to Computer Architecture", grade: "A", gpa: 4.0 },
      { pes: "Operating Systems", ucsd: "CSE 120", ucsdTitle: "Operating Systems Principles", grade: "A−", gpa: 3.67 },
      { pes: "Computer Networks", ucsd: "CSE 123", ucsdTitle: "Computer Networks", grade: "A−", gpa: 3.67 },
      { pes: "Compiler Design", ucsd: "CSE 131", ucsdTitle: "Compiler Construction", grade: "A−", gpa: 3.67 },
      { pes: "Cloud Computing", ucsd: "CSE 124", ucsdTitle: "Networked Services", grade: "A−", gpa: 3.67, approx: true },
      { pes: "Distributed Systems", ucsd: "CSE 223B", ucsdTitle: "Distributed Computing and Systems", grade: "A−", gpa: 3.67 },
      { pes: "Software and Systems Performance", ucsd: "CSE 291", ucsdTitle: "Systems Performance (special topics)", grade: "A", gpa: 4.0, approx: true },
    ],
  },
  {
    group: "Software Engineering, Web & Data",
    rows: [
      { pes: "Software Engineering", ucsd: "CSE 110", ucsdTitle: "Software Engineering", grade: "A−", gpa: 3.67 },
      { pes: "Object Oriented Analysis and Design with Java", ucsd: "CSE 112", ucsdTitle: "Advanced Software Engineering", grade: "A", gpa: 4.0 },
      { pes: "Web Technologies", ucsd: "CSE 135", ucsdTitle: "Online Database Analytics Applications", grade: "A−", gpa: 3.67 },
      { pes: "Database Management System", ucsd: "CSE 132A", ucsdTitle: "Database System Principles", grade: "A−", gpa: 3.67 },
      { pes: "Data Analytics", ucsd: "CSE 158", ucsdTitle: "Recommender Systems and Web Mining", grade: "A−", gpa: 3.67, taught: true },
      { pes: "Big Data", ucsd: "CSE 255", ucsdTitle: "Data Mining and Predictive Analytics", grade: "A−", gpa: 3.67 },
      { pes: "Blockchain and Its Applications", ucsd: "CSE 127", ucsdTitle: "Introduction to Computer Security", grade: "A−", gpa: 3.67, approx: true },
    ],
  },
  {
    group: "AI, ML & Vision",
    rows: [
      { pes: "Machine Intelligence", ucsd: "CSE 150A", ucsdTitle: "Introduction to Artificial Intelligence: Probabilistic Reasoning", grade: "A−", gpa: 3.67 },
      { pes: "Image Processing and Computer Vision", ucsd: "CSE 152A", ucsdTitle: "Introduction to Computer Vision I", grade: "A", gpa: 4.0, taught: true },
      { pes: "Image Processing & Data Viz Using MATLAB", ucsd: "CSE 166", ucsdTitle: "Image Processing", grade: "A", gpa: 4.0 },
      { pes: "Topics in Deep Learning", ucsd: "CSE 151B", ucsdTitle: "Deep Learning", grade: "A−", gpa: 3.67, taught: true },
    ],
  },
  {
    group: "Math & Theory",
    rows: [
      { pes: "Engineering Mathematics – I", ucsd: "MATH 20A", ucsdTitle: "Calculus for Science and Engineering", grade: "A−", gpa: 3.67 },
      { pes: "Engineering Mathematics – II", ucsd: "MATH 20B", ucsdTitle: "Calculus for Science and Engineering", grade: "A−", gpa: 3.67 },
      { pes: "Linear Algebra and Its Applications", ucsd: "MATH 18", ucsdTitle: "Linear Algebra", grade: "A−", gpa: 3.67 },
      { pes: "Statistics for Data Science", ucsd: "MATH 183", ucsdTitle: "Statistical Methods", grade: "A−", gpa: 3.67 },
    ],
  },
];
