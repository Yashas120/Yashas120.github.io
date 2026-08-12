export interface TeachingAppointment {
  id: string;
  course: string;
  dates: string;
  learners: string;
  contribution: string;
}

export const teachingLead =
  "Supported 656 learners as a Teaching Assistant across Image Processing and Computer Vision, Data Analytics, and graduate Deep Learning. Designed assignments and labs, produced solution material and demonstrations, ran office hours and forums, and built grading, competition, and web-submission workflows that made feedback more repeatable at course scale.";

export const teachingAppointments: TeachingAppointment[] = [
  {
    id: "ipcv",
    course: "Image Processing and Computer Vision",
    dates: "Dec 2022–May 2023",
    learners: "122 learners",
    contribution:
      "Created MATLAB labs and assignments, demonstrations, office-hour support, answer material, and reusable grading automation.",
  },
  {
    id: "data-analytics",
    course: "Data Analytics",
    dates: "Aug–Dec 2022",
    learners: "494 learners",
    contribution:
      "Connected analytical assignments, office hours, and forums with a Kaggle competition operated for 178 teams.",
  },
  {
    id: "deep-learning",
    course: "Deep Learning Theory and Practices",
    dates: "Jul–Dec 2022",
    learners: "Approximately 40 graduate learners",
    contribution:
      "Selected as an undergraduate TA; authored three assignments and labs, including a staged MNIST autoencoder, and built a web submission and autograding workflow.",
  },
];
