import { Publication } from "@/types";

export const publications: Publication[] = [
  {
    id: "swift-isr",
    title: "Towards Faster and Efficient Lightweight ISR Using Transformers and Fourier Convolutions",
    venue: "Artificial Intelligence and Applications",
    year: 2024,
    doi: "10.47852/bonviewAIA42021930",
    points: [
      "Hybrid Transformer + Fast Fourier Convolution model for image super-resolution.",
      "34% fewer parameters while being 60% faster.",
      "Dual Frequency Spatial block selectively gleans spatial + frequency-domain features.",
    ],
  },
  {
    id: "underwater-dc",
    title: "Monitoring and Alert Systems for Underwater Data Centers using Arduino",
    venue: "IEEE CSITSS",
    year: 2021,
    doi: "10.1109/CSITSS54238.2021.9683449",
    points: [
      "Resilient Arduino-based IoT device for monitoring underwater assets.",
      "Built with redundancy and high availability for expensive, hard-to-reach maintenance.",
    ],
  },
];
