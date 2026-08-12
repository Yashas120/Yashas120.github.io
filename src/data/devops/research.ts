export interface ResearchPublication {
  id: string;
  title: string;
  venue: string;
  date: string;
  contribution: string;
  ownership: string;
  links: { label: string; href: string }[];
}

export const researchIntro =
  "Two peer-reviewed publications connect efficient computer vision with monitoring and reliability. SWIFT studies a lighter super-resolution architecture; the underwater data-center work explores monitoring and alerts for difficult-to-service infrastructure.";

export const researchPublications: ResearchPublication[] = [
  {
    id: "swift-publication",
    title: "Towards Faster and Efficient Lightweight ISR Using Transformers and Fourier Convolutions",
    venue: "Artificial Intelligence and Applications",
    date: "2025 · online 2024",
    contribution:
      "Co-developed a SwinV2 and Fourier-domain super-resolution approach. The published comparison reports approximately 34% fewer parameters and up to 60% faster inference than the stated SwinIR lightweight baseline.",
    ownership: "Research · collaborative · public fork",
    links: [
      { label: "Paper", href: "https://doi.org/10.47852/bonviewAIA42021930" },
      { label: "Repository", href: "https://github.com/Yashas120/SWIFT" },
      { label: "Demo", href: "/demos#swift" },
    ],
  },
  {
    id: "underwater-publication",
    title: "Monitoring and Alert Systems for Underwater Data Centers using Arduino",
    venue: "IEEE CSITSS",
    date: "2021",
    contribution:
      "Contributed to a published Arduino and IoT monitoring-and-alert prototype for infrastructure where physical maintenance is difficult and costly.",
    ownership: "Research · collaborative · published prototype",
    links: [{ label: "Paper", href: "https://doi.org/10.1109/CSITSS54238.2021.9683449" }],
  },
];
