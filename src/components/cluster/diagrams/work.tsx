"use client";

import { motion, useTransform } from "framer-motion";
import { useTokens } from "../theme";
import { Box, Caption, Conn, Dot, Tag, useStep, type DiagramProps } from "./primitives";

const SVG = "h-full w-full";

export function EventTopologyDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const source = useStep(p, 0, 0.2);
  const transport = useStep(p, 0.18, 0.42);
  const consume = useStep(p, 0.4, 0.76);
  const store = useStep(p, 0.72, 1);

  if (vertical) {
    return (
      <svg viewBox="0 0 380 560" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Box x={90} y={36} w={200} h={48} label="source service" step={source} accent={t.blue} tone={tone} />
        <Conn d="M 190 84 L 190 142" step={transport} color={t.blue} tone={tone} />
        <Box x={70} y={142} w={240} h={52} label="managed AWS messaging" step={transport} accent={t.blue} tone={tone} />
        {[82, 298].map((x, index) => (
          <g key={x}>
            <Conn d={`M 190 194 L 190 236 L ${x} 236 L ${x} 278`} step={consume} color={t.blue} tone={tone} />
            <Box x={x - 60} y={278} w={120} h={48} label={`regional service ${index === 0 ? "A" : "B"}`} step={consume} tone={tone} />
            <Conn d={`M ${x} 326 L ${x} 398`} step={store} color={t.green} tone={tone} />
            <Box x={x - 60} y={398} w={120} h={44} label="SQL store" step={store} accent={t.green} tone={tone} />
          </g>
        ))}
        <Dot from={[190, 92]} to={[190, 138]} step={transport} tone={tone} />
        <Tag x={190} y={504} text="illustrative topology · not scale" step={store} color={t.muted} tone={tone} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 760 460" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Box x={32} y={202} w={142} h={52} label="source service" step={source} accent={t.blue} tone={tone} />
      <Conn d="M 174 228 L 246 228" step={transport} color={t.blue} tone={tone} />
      <Box x={246} y={194} w={180} h={68} label="managed messaging" sub="AWS boundary" step={transport} accent={t.blue} tone={tone} />
      {[122, 334].map((y, index) => (
        <g key={y}>
          <Conn d={`M 426 228 L 462 228 L 462 ${y + 26} L 500 ${y + 26}`} step={consume} color={t.blue} tone={tone} />
          <Box x={500} y={y} w={144} h={52} label={`regional service ${index === 0 ? "A" : "B"}`} step={consume} tone={tone} />
          <Conn d={`M 644 ${y + 26} L 682 ${y + 26}`} step={store} color={t.green} tone={tone} />
          <Box x={682} y={y + 4} w={70} h={44} label="SQL" step={store} accent={t.green} tone={tone} mono />
        </g>
      ))}
      <Dot from={[180, 228]} to={[242, 228]} step={transport} tone={tone} />
      <Caption x={380} y={52} text="one event · consequences across service boundaries" step={consume} tone={tone} />
      <Tag x={380} y={430} text="illustrative topology · not scale" step={store} color={t.muted} tone={tone} />
    </svg>
  );
}

/** One production topology that moves through order, discovery, cutover and recovery. */
export function SafeChangeDiagram({ p, vertical, tone }: Readonly<DiagramProps>) {
  const t = useTokens(tone);
  const order = useStep(p, 0, 0.23);
  const discover = useStep(p, 0.22, 0.44);
  const cutover = useStep(p, 0.43, 0.67);
  const failure = useStep(p, 0.66, 0.82);
  const recovered = useStep(p, 0.81, 1);
  const failureOpacity = useTransform(p, [0.64, 0.7, 0.83, 0.9], [0, 1, 1, 0]);
  const recoveryOpacity = useTransform(recovered, [0, 0.3, 1], [0, 1, 1]);

  if (vertical) {
    return (
      <svg viewBox="0 0 380 620" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <Caption x={190} y={26} text="1 · order" step={order} tone={tone} />
        <Box x={26} y={48} w={104} h={42} label="network" step={order} accent={t.blue} tone={tone} mono />
        <Box x={250} y={48} w={104} h={42} label="identity" step={order} accent={t.blue} tone={tone} mono />
        <Conn d="M 78 90 L 78 126 L 190 126 L 190 156" step={order} tone={tone} />
        <Conn d="M 302 90 L 302 126 L 190 126" step={order} tone={tone} />
        <Box x={120} y={156} w={140} h={44} label="service" step={order} accent={t.green} tone={tone} mono />

        <Caption x={190} y={238} text="2 · discover consumers + owners" step={discover} tone={tone} />
        <Conn d="M 190 200 L 190 264 L 82 264 L 82 294" step={discover} color={t.blue} tone={tone} />
        <Conn d="M 190 264 L 298 264 L 298 294" step={discover} color={t.blue} tone={tone} />
        <Box x={22} y={294} w={120} h={46} label="consumer" sub="owner A" step={discover} tone={tone} />
        <Box x={238} y={294} w={120} h={46} label="consumer" sub="owner B" step={discover} tone={tone} />

        <Caption x={190} y={378} text="3 · staged endpoint transition" step={cutover} tone={tone} />
        <Box x={24} y={398} w={140} h={46} label="old SQL store" step={cutover} tone={tone} />
        <Box x={216} y={398} w={140} h={46} label="new SQL store" step={cutover} accent={t.green} tone={tone} />
        <Conn d="M 164 421 L 216 421" step={cutover} color={t.green} dashed tone={tone} />

        <motion.g style={{ opacity: failureOpacity }}>
          <Conn d="M 286 444 L 286 496" step={failure} color={t.coral} dashed tone={tone} />
          <Box x={206} y={496} w={160} h={44} label="hidden dependency" step={failure} accent={t.coral} tone={tone} />
        </motion.g>
        <motion.g style={{ opacity: recoveryOpacity }}>
          <Box x={14} y={496} w={160} h={44} label="health checks" step={recovered} accent={t.green} tone={tone} />
          <Tag x={190} y={584} text="4 · recovered + verified" step={recovered} color={t.green} tone={tone} />
        </motion.g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 760 460" className={SVG} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Caption x={74} y={46} text="1 · order" step={order} anchor="start" tone={tone} />
      <Box x={44} y={70} w={122} h={44} label="network" step={order} accent={t.blue} tone={tone} mono />
      <Box x={44} y={144} w={122} h={44} label="identity" step={order} accent={t.blue} tone={tone} mono />
      <Conn d="M 166 92 L 214 92 L 214 160 L 250 160" step={order} tone={tone} />
      <Conn d="M 166 166 L 214 166" step={order} tone={tone} />
      <Box x={250} y={138} w={136} h={48} label="service" step={order} accent={t.green} tone={tone} mono />

      <Caption x={318} y={46} text="2 · discover" step={discover} tone={tone} />
      <Conn d="M 318 186 L 318 228 L 470 228" step={discover} color={t.blue} tone={tone} />
      <Box x={438} y={86} w={130} h={46} label="consumer" sub="owner A" step={discover} tone={tone} />
      <Box x={438} y={206} w={130} h={46} label="consumer" sub="owner B" step={discover} tone={tone} />
      <Conn d="M 470 228 L 470 132" step={discover} color={t.blue} tone={tone} />

      <Caption x={648} y={46} text="3 · cut over" step={cutover} tone={tone} />
      <Box x={610} y={88} w={116} h={44} label="old store" step={cutover} tone={tone} />
      <Box x={610} y={208} w={116} h={44} label="new store" step={cutover} accent={t.green} tone={tone} />
      <Conn d="M 568 110 L 610 110" step={cutover} tone={tone} />
      <Conn d="M 568 230 L 610 230" step={cutover} color={t.green} tone={tone} />

      <motion.g style={{ opacity: failureOpacity }}>
        <Conn d="M 318 252 L 318 318" step={failure} color={t.coral} dashed tone={tone} />
        <Box x={220} y={318} w={196} h={46} label="hidden dependency" step={failure} accent={t.coral} tone={tone} />
        <Caption x={318} y={388} text="rollout interrupted" step={failure} tone={tone} />
      </motion.g>
      <motion.g style={{ opacity: recoveryOpacity }}>
        <Box x={454} y={318} w={150} h={46} label="health checks" step={recovered} accent={t.green} tone={tone} />
        <Conn d="M 416 341 L 454 341" step={recovered} color={t.green} tone={tone} />
        <Tag x={380} y={430} text="4 · recovered + verified" step={recovered} color={t.green} tone={tone} />
      </motion.g>
    </svg>
  );
}
