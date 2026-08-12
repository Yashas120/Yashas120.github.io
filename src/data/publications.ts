import { Publication } from "@/types";

export const publications: Publication[] = [
  {
    id: "swift-isr",
    title: "Toward Faster and Efficient Lightweight Image Super-Resolution Using Transformers and Fourier Convolutions",
    venue: "Artificial Intelligence and Applications",
    year: 2025,
    doi: "10.47852/bonviewAIA42021930",
    publishedOnline: "16 Jan 2024",
    issueYear: 2025,
    authors: ["Vishal Ramesha", "Yashas Kadambi", "B. S. Abhishek Aditya", "T. Vijay Prashant", "S. S. Shylaja"],
    citation: "Artificial Intelligence and Applications, vol. 3, no. 2, pp. 168–178, 2025; published online 16 Jan 2024.",
    contribution: "Conceptualization, software, validation, investigation, data curation, and writing/review.",
    paperUrl: "https://ojs.bonviewpress.com/index.php/AIA/article/view/1930",
    points: [
      "Hybrid Transformer + Fast Fourier Convolution model for image super-resolution.",
      "Reported approximately 34% fewer parameters and up to 60% faster inference in the stated comparison.",
      "Dual Frequency Spatial block selectively gleans spatial + frequency-domain features.",
    ],
  },
  {
    id: "underwater-dc",
    title: "Monitoring and Alert Systems for Underwater Data Centers using Arduino",
    venue: "IEEE CSITSS",
    year: 2021,
    doi: "10.1109/CSITSS54238.2021.9683449",
    citation: "Y. Kadambi et al., IEEE CSITSS, 2021.",
    contribution: "Collaborative embedded monitoring and alerting research.",
    paperUrl: "https://doi.org/10.1109/CSITSS54238.2021.9683449",
    points: [
      "Resilient Arduino-based IoT device for monitoring underwater assets.",
      "Built with redundancy and high availability for expensive, hard-to-reach maintenance.",
    ],
  },
];
