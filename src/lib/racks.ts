// Shared geometry for the server-room racks used by the ServerRoom backdrop.

export const VIEWBOX = { w: 640, h: 240 };
export const FLOOR_Y = 220;

// Pan/zoom applied to the backdrop SVG as you step through scenes.
export const PAN = {
  x: ["2%", "-14%"] as [string, string],
  scale: [1.02, 1.16] as [number, number],
};

export interface Rack {
  i: number;
  x: number; // left edge
  w: number;
  h: number;
  yTop: number;
  cx: number; // horizontal center
  slots: { x: number; y: number }[]; // unit-slot anchors
}

function buildRack(i: number): Rack {
  const w = 60;
  const h = 150;
  const x = 20 + i * 80;
  const yTop = FLOOR_Y - h; // 70
  const cx = x + w / 2;
  const units = Math.floor(h / 14); // 10 unit lines
  const slots = Array.from({ length: units }, (_, u) => ({ x: cx, y: yTop + 10 + u * 14 }));
  return { i, x, w, h, yTop, cx, slots };
}

export const FRONT_RACKS: Rack[] = Array.from({ length: 8 }, (_, i) => buildRack(i));
