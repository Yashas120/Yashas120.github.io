import { ClusterFilm } from "@/components/cluster/ClusterFilm";
import { ClusterShell } from "@/components/cluster/ClusterShell";
import { ClusterProjectLabs } from "@/components/cluster/ClusterProjectLabs";
import { CompleteProfileIndex } from "@/components/cluster/CompleteProfileIndex";
import { ClusterThemeProvider } from "@/components/cluster/theme";

export default function ClusterPage() {
  return (
    <ClusterThemeProvider>
      <ClusterShell>
        <main id="cluster-main">
          <ClusterFilm />
          <ClusterProjectLabs />
          <CompleteProfileIndex />
        </main>
      </ClusterShell>
    </ClusterThemeProvider>
  );
}
