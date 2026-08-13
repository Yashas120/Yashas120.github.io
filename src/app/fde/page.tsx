import { DossierAnnex } from "@/components/fde/dossier/DossierAnnex";
import { DossierHeader } from "@/components/fde/dossier/DossierHeader";
import { DossierStage } from "@/components/fde/dossier/DossierStage";
import { BG, COBALT, INK } from "@/components/fde/dossier/kit";

const skipClass =
  "sr-only font-mono text-[11px] uppercase tracking-[0.14em] focus:not-sr-only focus:fixed focus:left-4 focus:z-[80] focus:px-4 focus:py-3 focus:outline focus:outline-2 focus:outline-offset-2";

export default function FdePage() {
  return (
    <div className="fde-root relative min-h-[100svh]" style={{ background: BG, color: INK }}>
      <a href="#evidence-index" className={`${skipClass} focus:top-4`} style={{ background: COBALT, color: BG }}>Skip to verified record</a>
      <a href="#contact" className={`${skipClass} focus:top-16`} style={{ background: COBALT, color: BG }}>Skip to contact</a>
      <DossierHeader />
      <main>
        <DossierStage />
        <DossierAnnex />
      </main>
    </div>
  );
}
