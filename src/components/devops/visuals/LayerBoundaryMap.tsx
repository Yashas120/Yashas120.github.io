"use client";

import { boundaryLayers } from "@/data/devops/experience";
import { DV } from "../tokens";
import { DiagramFrame, Edge, GNode } from "./parts";

export function LayerBoundaryMap({ live }: Readonly<{ live?: boolean }>) {
  return (
    <DiagramFrame
      title="Professional system-boundary map"
      desc={`The professional evidence crosses six layers: ${boundaryLayers.join(", ")}. Cloud and backend work occupies the service and deployment layers; optical work extends through operating-system, driver, firmware, hardware, and telemetry boundaries. Transferable reliability practices connect the layers without implying that optical work was cloud ownership.`}
      height={356}
    >
      {boundaryLayers.map((layer, index) => {
        const y = 6 + index * 58;
        return (
          <g key={layer}>
            <GNode
              x={50}
              y={y}
              w={260}
              h={34}
              lines={[layer]}
              accent={index < 2 ? DV.cyan : index < 5 ? DV.amber : DV.green}
            />
            {index < boundaryLayers.length - 1 && (
              <Edge
                d={`M 180 ${y + 34} V ${y + 58}`}
                accent={DV.muted}
                flow={live}
                delay={index * 120}
                head={{ x: 180, y: y + 58, dir: "down" }}
              />
            )}
          </g>
        );
      })}
    </DiagramFrame>
  );
}
