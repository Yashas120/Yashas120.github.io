"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Binary,
  Braces,
  Check,
  Copy,
  FileCode2,
  ListTree,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { LiveDemo } from "./LiveDemo";
import { usePrefersReducedMotion } from "./bitcoin/parts";
import {
  buildTrace,
  EXAMPLES,
  type CompilePhase,
  type Expr,
  type FuncDef,
  type IRTag,
  type LexEvent,
  type Program,
  type Stmt,
  type Token,
  type TokenSpan,
  type TokKind,
} from "@/lib/demos/chocollvm";
import { cardProps } from "@/data/demos";

const REPO = "https://github.com/Yashas120/chocollvm";
const CHOCO = "#8b5cf6";

function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
}

// The demo has hand-picked syntax/status colors that must adapt to the theme:
// bright-on-dark hues become darker, higher-contrast hues on the light surface.
interface Palette {
  name: string;
  number: string;
  str: string;
  op: string;
  dim: string;
  comment: string;
  blue: string;
  accent: string;
  hlFg: string;
  danger: string;
  dangerText: string;
  ok: string;
}

function palette(light: boolean): Palette {
  return light
    ? {
        name: "#27272a",
        number: "#b45309",
        str: "#15803d",
        op: "#52525b",
        dim: "#94a3b8",
        comment: "#94a3b8",
        blue: "#2563eb",
        accent: "#7c3aed",
        hlFg: "#18181b",
        danger: "#dc2626",
        dangerText: "#b91c1c",
        ok: "#15803d",
      }
    : {
        name: "#e4e4e7",
        number: "#f59e0b",
        str: "#4ade80",
        op: "#9ca3af",
        dim: "#52525b",
        comment: "#71717a",
        blue: "#93c5fd",
        accent: CHOCO,
        hlFg: "#ffffff",
        danger: "#ef4444",
        dangerText: "#fca5a5",
        ok: "#4ade80",
      };
}

function tokColors(p: Palette): Record<TokKind, string> {
  return {
    KEYWORD: p.accent,
    NAME: p.name,
    NUMBER: p.number,
    STRING: p.str,
    OP: p.op,
    NEWLINE: p.dim,
    INDENT: p.dim,
    DEDENT: p.dim,
    EOF: p.dim,
  };
}

// Tracks whether the site is in light mode by observing the `light` class the
// theme toggle sets on <html>. Starts dark to match SSR, corrects on mount.
function useIsLight(): boolean {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setLight(el.classList.contains("light"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return light;
}

type View = "tokens" | "ast" | "ir";
type Phase = "idle" | "lex" | "parse" | "codegen" | "done";
type StagePhase = "lex" | "parse" | "codegen";

interface Stats {
  lines: number;
  tokens: number;
  nodes: number;
  ir: number;
}

function nextAnim(
  a: { phase: Phase; step: number },
  sizes: { lex: number; parse: number; codegen: number }
): { phase: Phase; step: number } {
  if (a.phase === "idle" || a.phase === "done") return a;
  const order: StagePhase[] = ["lex", "parse", "codegen"];
  const size = sizes[a.phase];
  if (a.step + 1 < size) return { phase: a.phase, step: a.step + 1 };
  const idx = order.indexOf(a.phase);
  for (let j = idx + 1; j < order.length; j++) {
    if (sizes[order[j]] > 0) return { phase: order[j], step: 0 };
  }
  return { phase: "done", step: Math.max(0, size - 1) };
}

export function ChocoLLVMDemo({ embedded = false }: Readonly<{ embedded?: boolean }> = {}) {
  const [source, setSource] = useState(EXAMPLES[0].source);
  const [view, setView] = useState<View>("ir");
  const [anim, setAnim] = useState<{ phase: Phase; step: number }>({ phase: "idle", step: 0 });
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const result = useMemo(() => buildTrace(source), [source]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const p = palette(useIsLight());

  const parseNodes = useMemo<Flat[]>(() => (result.ast ? flattenProgram(result.ast) : []), [result.ast]);

  const sizes = useMemo(
    () => ({ lex: result.events.length, parse: parseNodes.length, codegen: result.irLines.length }),
    [result.events.length, parseNodes.length, result.irLines.length]
  );

  const stats = useMemo<Stats>(
    () => ({
      lines: source.split("\n").filter((l) => l.trim() !== "").length,
      tokens: result.tokens.filter(
        (t) => t.kind !== "EOF" && t.kind !== "NEWLINE" && t.kind !== "INDENT" && t.kind !== "DEDENT"
      ).length,
      nodes: parseNodes.length,
      ir: result.irLines.length,
    }),
    [source, result, parseNodes.length]
  );

  // reset the animation whenever the source changes
  useEffect(() => {
    setAnim({ phase: "idle", step: 0 });
    setPlaying(false);
  }, [source]);

  // animation clock
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setAnim((a) => nextAnim(a, sizes)), Math.max(70, 340 / speed));
    return () => clearInterval(id);
  }, [playing, speed, sizes]);

  useEffect(() => {
    if (anim.phase === "done") setPlaying(false);
  }, [anim.phase]);

  const animating = anim.phase !== "idle";
  const shownPhase: StagePhase =
    anim.phase === "lex"
      ? "lex"
      : anim.phase === "parse"
      ? "parse"
      : anim.phase === "codegen" || anim.phase === "done"
      ? "codegen"
      : view === "tokens"
      ? "lex"
      : view === "ast"
      ? "parse"
      : "codegen";

  const run = () => {
    if (sizes.lex + sizes.parse + sizes.codegen === 0) return;
    setAnim({ phase: "lex", step: 0 });
    setPlaying(true);
  };
  const togglePlay = () => {
    if (anim.phase === "idle" || anim.phase === "done") return run();
    setPlaying((p) => !p);
  };
  const pick = (v: View) => {
    setPlaying(false);
    setAnim({ phase: "idle", step: 0 });
    setView(v);
  };

  const pipelineView: View = animating
    ? shownPhase === "lex"
      ? "tokens"
      : shownPhase === "parse"
      ? "ast"
      : "ir"
    : view;

  // While the pipeline runs, the left column stops being a static editor. For
  // lex/parse it shows the *source* being consumed (current position highlit);
  // for codegen the input is the *AST*, so it shows the tree with the node being
  // lowered highlighted. The right column only shows the produced output, so
  // neither side scrolls much.
  const sweeping = anim.phase === "lex" || anim.phase === "parse" || anim.phase === "codegen";
  const hilite: { range: [number, number] | null; color: string } | null = (() => {
    if (!sweeping) return null;
    if (shownPhase === "lex") {
      if (!result.events.length) return null;
      const ev = result.events[Math.min(anim.step, result.events.length - 1)];
      return { range: [ev.start, ev.end], color: eventColor(ev, p) };
    }
    if (shownPhase === "parse") {
      if (!parseNodes.length) return null;
      const nd = parseNodes[Math.min(anim.step, parseNodes.length - 1)];
      return { range: spanToRange(nd.span, result.tokens), color: p.accent };
    }
    return null; // codegen highlights the AST, not the source (see codegenCurIdx)
  })();
  const codegenCurIdx =
    sweeping && shownPhase === "codegen" && result.irLines.length
      ? tagNodeIndex(result.irTags[Math.min(anim.step, result.irLines.length - 1)] ?? null, parseNodes)
      : -1;

  return (
    <LiveDemo
      title="ChocoLLVM — ChocoPy → LLVM IR"
      subtitle="A compiler frontend, from scratch: type ChocoPy on the left and press run to watch it lower — the lexer sweeps the source, the parser builds the tree, and codegen emits real LLVM IR."
      repoUrl={REPO}
      accent={CHOCO}
      embedded={embedded}
      {...cardProps("chocollvm")}
    >
      {/* interactive compiler pipeline (also the output selector) */}
      <Pipeline
        view={pipelineView}
        onPick={pick}
        stats={stats}
        errorPhase={result.errorPhase}
        onFocusSource={() => {
          pick(view);
          textareaRef.current?.focus();
        }}
      />

      {/* transport + examples */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] font-medium text-black transition-opacity hover:opacity-90"
          style={{ background: CHOCO }}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "pause" : anim.phase === "idle" || anim.phase === "done" ? "run pipeline" : "resume"}
        </button>
        <button
          onClick={run}
          title="restart"
          aria-label="Restart the compilation trace"
          className="flex items-center rounded-md border px-2 py-1.5 text-zinc-300 transition-colors hover:text-zinc-100"
          style={{ borderColor: "rgb(var(--line) / 0.15)" }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-1">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="rounded px-1.5 py-1 font-mono text-[10px]"
              style={{
                background: speed === s ? rgba(CHOCO, 0.15) : "transparent",
                color: speed === s ? p.accent : "rgb(var(--zinc-500))",
                border: `1px solid ${speed === s ? rgba(CHOCO, 0.4) : "rgb(var(--line) / 0.12)"}`,
              }}
            >
              {s}x
            </button>
          ))}
        </div>
        {animating && (
          <span className="font-mono text-[10px] text-zinc-500">
            {anim.phase === "done"
              ? "done"
              : `${shownPhase} · ${anim.step + 1}/${Math.max(1, sizes[shownPhase])}`}
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-zinc-600">examples</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.name}
            onClick={() => setSource(ex.source)}
            className="rounded-full border px-2.5 py-1 font-mono text-[10px] text-zinc-300 transition-colors hover:text-zinc-100"
            style={{ borderColor: "rgb(var(--line) / 0.12)" }}
          >
            {ex.name}
          </button>
        ))}
      </div>

      <p className="mb-3 font-mono text-[10px] leading-relaxed text-zinc-600">
        A simplified, from-scratch in-browser reimplementation of a ChocoPy subset (int/bool,
        functions, if/while) — the IR is illustrative and hand-emitted, not the exact llvmlite output
        of the real project.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* editor / live source sweep */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            <span style={sweeping ? { color: p.accent } : undefined}>
              {sweeping
                ? shownPhase === "lex"
                  ? "lexing source"
                  : shownPhase === "parse"
                  ? "parsing source"
                  : "AST (input)"
                : "ChocoPy source"}
            </span>
          </div>
          {sweeping ? (
            <div
              className="w-full flex-1 overflow-auto rounded-lg border bg-ink-900 p-3"
              style={{ borderColor: "rgb(var(--line) / 0.12)", minHeight: 340, maxHeight: 460 }}
            >
              {shownPhase === "codegen" ? (
                <AstList nodes={parseNodes} curIdx={codegenCurIdx} p={p} />
              ) : (
                <HiliteSource source={source} range={hilite?.range ?? null} color={hilite?.color} />
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              spellCheck={false}
              rows={16}
              className="w-full flex-1 resize-y rounded-lg border bg-ink-900 p-3 font-mono text-[12px] leading-relaxed text-zinc-200 outline-none"
              style={{ borderColor: "rgb(var(--line) / 0.12)" }}
            />
          )}
          {result.error ? (
            <div
              className="mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs"
              style={{ borderColor: rgba(p.danger, 0.4), background: rgba(p.danger, 0.08), color: p.dangerText }}
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-mono">
                {result.errorLine ? `line ${result.errorLine}: ` : ""}
                {result.error}
              </span>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px]" style={{ color: p.ok }}>
              <Check className="h-3.5 w-3.5" /> compiled · {stats.tokens} tokens ·{" "}
              {result.ast ? result.ast.funcs.length : 0} function
              {result.ast && result.ast.funcs.length === 1 ? "" : "s"}
            </div>
          )}
        </div>

        {/* output */}
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide text-zinc-500">
            <span style={{ color: p.accent }}>
              {shownPhase === "lex" ? "lexer" : shownPhase === "parse" ? "parser" : "codegen"}
            </span>
            <span className="text-zinc-600">
              {animating ? "· animating — click a stage to inspect" : "· click a stage above, or press run"}
            </span>
          </div>

          <div
            className="flex-1 overflow-auto rounded-lg border bg-ink-900 p-3"
            style={{ borderColor: "rgb(var(--line) / 0.12)", maxHeight: 460, minHeight: 340 }}
          >
            {animating ? (
              shownPhase === "lex" ? (
                <AnimLexView events={result.events} step={anim.step} />
              ) : shownPhase === "parse" ? (
                result.ast ? (
                  <AnimParseView nodes={parseNodes} step={anim.step} />
                ) : (
                  <Empty />
                )
              ) : result.ir ? (
                <AnimCodegenView
                  nodes={parseNodes}
                  irLines={result.irLines}
                  tags={result.irTags}
                  step={anim.phase === "done" ? result.irLines.length - 1 : anim.step}
                />
              ) : (
                <Empty />
              )
            ) : view === "tokens" ? (
              <TokensView tokens={result.tokens} />
            ) : view === "ast" ? (
              result.ast ? (
                <AstView ast={result.ast} />
              ) : (
                <Empty />
              )
            ) : result.ir ? (
              <IRView ir={result.ir} />
            ) : (
              <Empty />
            )}
          </div>
        </div>
      </div>
    </LiveDemo>
  );
}

export function ChocoLLVMLab() {
  return <ChocoLLVMDemo embedded />;
}

// ------------------------------- pipeline -------------------------------

type NodeState = "ok" | "active" | "error" | "blocked";

interface PipeStage {
  id: string;
  view: View | null;
  icon: ReactNode;
  label: string;
  statKey: keyof Stats;
  unit: string;
  phase: CompilePhase | null;
}

const PIPE: PipeStage[] = [
  { id: "source", view: null, icon: <FileCode2 className="h-4 w-4" />, label: "source", statKey: "lines", unit: "lines", phase: null },
  { id: "lex", view: "tokens", icon: <ListTree className="h-4 w-4" />, label: "lex", statKey: "tokens", unit: "tokens", phase: "lex" },
  { id: "parse", view: "ast", icon: <Braces className="h-4 w-4" />, label: "parse", statKey: "nodes", unit: "nodes", phase: "parse" },
  { id: "codegen", view: "ir", icon: <Binary className="h-4 w-4" />, label: "codegen", statKey: "ir", unit: "IR lines", phase: "codegen" },
];

function Pipeline({
  view,
  onPick,
  stats,
  errorPhase,
  onFocusSource,
}: {
  view: View;
  onPick: (v: View) => void;
  stats: Stats;
  errorPhase: CompilePhase | null;
  onFocusSource: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const p = palette(useIsLight());
  const failIdx = errorPhase ? PIPE.findIndex((s) => s.phase === errorPhase) : -1;

  const stateOf = (i: number): NodeState => {
    if (failIdx >= 0) {
      if (i === failIdx) return "error";
      if (i > failIdx) return "blocked";
    }
    return PIPE[i].view === view ? "active" : "ok";
  };

  return (
    <div className="mb-4 overflow-x-auto">
      <style>{`@keyframes chocoflow{0%{left:0;opacity:0}15%{opacity:1}85%{opacity:1}100%{left:calc(100% - 4px);opacity:0}}`}</style>
      <div className="flex min-w-[480px] items-stretch">
        {PIPE.map((s, i) => {
          const st = stateOf(i);
          const clickable = st !== "blocked";
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => (s.view ? onPick(s.view) : onFocusSource())}
                className="flex w-full flex-col items-center gap-1 rounded-lg border px-2 py-2.5 transition-colors"
                style={nodeStyle(st, p)}
              >
                <div className="flex items-center gap-1.5">
                  {s.icon}
                  <span className="font-mono text-[11px] font-medium">{s.label}</span>
                  {st === "error" && <AlertTriangle className="h-3 w-3" />}
                </div>
                <span className="font-mono text-[10px] opacity-70">
                  {st === "blocked" || st === "error" ? "—" : `${stats[s.statKey]} ${s.unit}`}
                </span>
              </button>
              {i < PIPE.length - 1 && (
                <Connector state={stateOf(i + 1)} animate={!reduced && failIdx < 0} danger={p.danger} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function nodeStyle(st: NodeState, p: Palette): React.CSSProperties {
  switch (st) {
    case "active":
      return { background: rgba(CHOCO, 0.16), borderColor: rgba(CHOCO, 0.6), color: p.accent };
    case "error":
      return { background: rgba(p.danger, 0.1), borderColor: rgba(p.danger, 0.5), color: p.dangerText };
    case "blocked":
      return { borderColor: "rgb(var(--line) / 0.12)", color: "rgb(var(--zinc-600))", borderStyle: "dashed", opacity: 0.5, cursor: "not-allowed" };
    default:
      return { background: "transparent", borderColor: rgba(CHOCO, 0.25), color: p.accent };
  }
}

function Connector({ state, animate, danger }: { state: NodeState; animate: boolean; danger: string }) {
  const color = state === "error" ? danger : state === "blocked" ? "rgb(var(--line) / 0.2)" : rgba(CHOCO, 0.4);
  return (
    <div className="relative mx-1 h-[2px] w-6 flex-shrink-0" style={{ background: color }}>
      {animate && state !== "blocked" && state !== "error" && (
        <span
          className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full"
          style={{ background: CHOCO, animation: "chocoflow 1.6s linear infinite" }}
        />
      )}
    </div>
  );
}

function Empty() {
  return <div className="font-mono text-xs text-zinc-600">— fix the error to see output —</div>;
}

// ------------------------------- tokens -------------------------------

function TokensView({ tokens }: { tokens: Token[] }) {
  const c = tokColors(palette(useIsLight()));
  return (
    <div className="flex flex-wrap gap-1">
      {tokens.map((t, i) => {
        if (t.kind === "EOF") return null;
        if (t.kind === "NEWLINE") return <div key={i} className="basis-full" />;
        if (t.kind === "INDENT" || t.kind === "DEDENT") {
          return (
            <span key={i} className="rounded px-1 py-0.5 font-mono text-[9px] text-zinc-600">
              {t.kind === "INDENT" ? "⇥" : "⇤"}
            </span>
          );
        }
        return (
          <span
            key={i}
            title={`${t.kind} @ line ${t.line}`}
            className="rounded px-1.5 py-0.5 font-mono text-[11px]"
            style={{ background: rgba(c[t.kind], 0.12), color: c[t.kind] }}
          >
            {t.value}
          </span>
        );
      })}
    </div>
  );
}

// ------------------------------- AST -------------------------------

interface TreeNode {
  label: string;
  accent?: boolean;
  span?: TokenSpan;
  children?: TreeNode[];
}

function exprTree(e: Expr): TreeNode {
  const sp = e.span;
  switch (e.kind) {
    case "Num":
      return { label: `Num ${e.value}`, span: sp };
    case "Bool":
      return { label: `Bool ${e.value}`, span: sp };
    case "Str":
      return { label: `Str "${e.value}"`, span: sp };
    case "Name":
      return { label: `Name ${e.id}`, accent: true, span: sp };
    case "Unary":
      return { label: `Unary ${e.op}`, span: sp, children: [exprTree(e.operand)] };
    case "Binary":
      return { label: `Binary ${e.op}`, span: sp, children: [exprTree(e.left), exprTree(e.right)] };
    case "Compare":
      return { label: `Compare ${e.op}`, span: sp, children: [exprTree(e.left), exprTree(e.right)] };
    case "BoolOp":
      return { label: `BoolOp ${e.op}`, span: sp, children: [exprTree(e.left), exprTree(e.right)] };
    case "Call":
      return { label: `Call ${e.func}`, accent: true, span: sp, children: e.args.map(exprTree) };
  }
}

function stmtTree(s: Stmt): TreeNode {
  const sp = s.span;
  switch (s.kind) {
    case "VarDef":
      return { label: `VarDef ${s.name}: ${s.type}`, span: sp, children: [exprTree(s.value)] };
    case "Assign":
      return { label: `Assign ${s.name}`, span: sp, children: [exprTree(s.value)] };
    case "ExprStmt":
      return { label: "ExprStmt", span: sp, children: [exprTree(s.expr)] };
    case "If":
      return {
        label: "If",
        span: sp,
        children: [
          { label: "cond", children: [exprTree(s.cond)] },
          { label: "body", children: s.body.map(stmtTree) },
          ...(s.orelse.length ? [{ label: "else", children: s.orelse.map(stmtTree) }] : []),
        ],
      };
    case "While":
      return {
        label: "While",
        span: sp,
        children: [
          { label: "cond", children: [exprTree(s.cond)] },
          { label: "body", children: s.body.map(stmtTree) },
        ],
      };
    case "Return":
      return { label: "Return", span: sp, children: s.value ? [exprTree(s.value)] : [] };
    case "Pass":
      return { label: "Pass", span: sp };
    case "Global":
      return { label: `Global ${s.name}`, span: sp };
  }
}

function funcTree(f: FuncDef): TreeNode {
  const sig = `${f.params.map((p) => `${p.name}: ${p.type}`).join(", ")}`;
  return {
    label: `FuncDef ${f.name}(${sig}) -> ${f.ret}`,
    accent: true,
    span: f.span,
    children: [...f.locals.map(stmtTree), ...f.body.map(stmtTree)],
  };
}

interface Flat {
  label: string;
  depth: number;
  accent?: boolean;
  span?: TokenSpan;
}

function flattenNode(n: TreeNode, depth: number, out: Flat[]) {
  out.push({ label: n.label, depth, accent: n.accent, span: n.span });
  n.children?.forEach((c) => flattenNode(c, depth + 1, out));
}

function flattenProgram(p: Program): Flat[] {
  const out: Flat[] = [];
  flattenNode(programTree(p), 0, out);
  return out;
}

// map a node's token span to absolute source char offsets (trimming trailing
// NEWLINE/INDENT/DEDENT tokens so the highlight hugs the real text)
function spanToRange(span: TokenSpan | undefined, tokens: Token[]): [number, number] | null {
  if (!span) return null;
  let e = span.e - 1;
  while (
    e > span.s &&
    (tokens[e]?.kind === "NEWLINE" || tokens[e]?.kind === "DEDENT" || tokens[e]?.kind === "INDENT")
  ) {
    e--;
  }
  const st = tokens[span.s];
  const en = tokens[Math.max(span.s, e)];
  if (!st || !en) return null;
  return [st.start, en.end];
}

function programTree(p: Program): TreeNode {
  const children: TreeNode[] = [];
  if (p.globals.length) children.push({ label: "globals", children: p.globals.map(stmtTree) });
  if (p.funcs.length) children.push({ label: "functions", children: p.funcs.map(funcTree) });
  if (p.main.length) children.push({ label: "main", children: p.main.map(stmtTree) });
  return { label: "Program", accent: true, children };
}

function TreeView({ node, accent, depth = 0 }: { node: TreeNode; accent: string; depth?: number }) {
  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 14 }}>
      <div
        className="font-mono text-[11px] leading-relaxed"
        style={{
          color: node.accent ? accent : "rgb(var(--zinc-300))",
          borderLeft: depth === 0 ? "none" : "1px solid rgb(var(--line) / 0.12)",
          paddingLeft: depth === 0 ? 0 : 6,
        }}
      >
        {node.label}
      </div>
      {node.children?.map((c, i) => (
        <TreeView key={i} node={c} accent={accent} depth={depth + 1} />
      ))}
    </div>
  );
}

function AstView({ ast }: { ast: Program }) {
  const p = palette(useIsLight());
  return <TreeView node={programTree(ast)} accent={p.accent} />;
}

// ------------------------------- IR -------------------------------

function irLineColor(line: string, p: Palette): string {
  const t = line.trim();
  if (t.startsWith(";")) return p.dim; // comment
  if (/^[A-Za-z0-9_.]+:$/.test(t)) return p.accent; // label
  if (t.startsWith("define") || t.startsWith("declare") || t.startsWith("}") || t.startsWith("source_filename"))
    return p.blue; // top-level keywords
  return "rgb(var(--zinc-300))";
}

function IRView({ ir }: { ir: string }) {
  const [copied, setCopied] = useState(false);
  const p = palette(useIsLight());
  const lines = ir.replace(/\n$/, "").split("\n");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ir);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* no-op */
    }
  };
  return (
    <div className="relative">
      <button
        onClick={copy}
        className="absolute right-0 top-0 flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] text-zinc-300 transition-colors hover:text-zinc-100"
        style={{ borderColor: "rgb(var(--line) / 0.15)", background: "rgb(var(--ink-800))" }}
      >
        {copied ? <Check className="h-3 w-3" style={{ color: p.ok }} /> : <Copy className="h-3 w-3" />}
        {copied ? "copied" : "copy"}
      </button>
      <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed">
        {lines.map((l, i) => (
          <div key={i} className="flex">
            <span className="mr-3 w-6 flex-shrink-0 select-none text-right text-zinc-700">{i + 1}</span>
            <span style={{ color: irLineColor(l, p), whiteSpace: "pre" }}>{l || " "}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

// ------------------------------- animated views -------------------------------

// Renders the source with a single highlighted range; text before the range is
// dimmed (already consumed) and text after is a lighter grey (pending).
function HiliteSource({
  source,
  range,
  color = CHOCO,
}: {
  source: string;
  range: [number, number] | null;
  color?: string;
}) {
  const p = palette(useIsLight());
  if (!range) {
    return (
      <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-zinc-400">{source}</pre>
    );
  }
  const [s, e] = range;
  return (
    <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
      <span style={{ color: "rgb(var(--zinc-600))" }}>{source.slice(0, s)}</span>
      <span style={{ background: rgba(color, 0.35), color: p.hlFg, borderRadius: 2, padding: "0 1px" }}>
        {source.slice(s, e)}
      </span>
      <span style={{ color: "rgb(var(--zinc-500))" }}>{source.slice(e)}</span>
    </pre>
  );
}

function eventColor(ev: LexEvent, p: Palette): string {
  if (ev.type === "token" && ev.token) return tokColors(p)[ev.token.kind];
  if (ev.type === "comment") return p.comment;
  if (ev.type === "indent" || ev.type === "dedent") return p.blue;
  return p.dim; // newline
}

function AnimLexView({ events, step }: { events: LexEvent[]; step: number }) {
  const p = palette(useIsLight());
  const c = tokColors(p);
  if (events.length === 0) {
    return <div className="font-mono text-xs text-zinc-600">— nothing to lex —</div>;
  }
  const idx = Math.min(step, events.length - 1);
  const cur = events[idx];
  const color = eventColor(cur, p);
  const produced = events
    .slice(0, idx + 1)
    .filter((ev) => ev.type === "token" && ev.token)
    .map((ev) => ev.token as Token);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
        <span style={{ color }}>{cur.label}</span>
        {cur.type === "token" && cur.token && (
          <span className="rounded px-1.5 py-0.5" style={{ background: rgba(color, 0.14), color }}>
            {cur.token.value}
          </span>
        )}
      </div>
      <div className="border-t pt-2" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
        <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-zinc-600">
          tokens ({produced.length})
        </div>
        <div className="flex flex-wrap gap-1">
          {produced.map((t, i) => (
            <span
              key={i}
              className="rounded px-1.5 py-0.5 font-mono text-[11px]"
              style={{
                background: rgba(c[t.kind], 0.12),
                color: c[t.kind],
                outline: i === produced.length - 1 ? `1px solid ${c[t.kind]}` : "none",
              }}
            >
              {t.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnimParseView({ nodes, step }: { nodes: Flat[]; step: number }) {
  const p = palette(useIsLight());
  if (nodes.length === 0) {
    return <div className="font-mono text-xs text-zinc-600">— nothing to parse —</div>;
  }
  const idx = Math.min(step, nodes.length - 1);
  const revealed = nodes.slice(0, idx + 1);
  return (
    <div className="space-y-3">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-zinc-600">AST (output)</div>
      <div className="border-t pt-2" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
        {revealed.map((n, i) => {
          const isCur = i === revealed.length - 1;
          return (
            <div
              key={i}
              className="font-mono text-[11px] leading-relaxed"
              style={{
                paddingLeft: 6 + n.depth * 14,
                color: isCur ? p.hlFg : n.accent ? p.accent : "rgb(var(--zinc-300))",
                background: isCur ? rgba(CHOCO, 0.18) : "transparent",
                borderRadius: 3,
              }}
            >
              {n.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// find the flattened-AST node that emitted a given IR line, matching by token
// span (and disambiguating shared spans by label)
function tagNodeIndex(tag: IRTag | null, nodes: Flat[]): number {
  if (!tag || !tag.span) return -1;
  let best = -1;
  for (let i = 0; i < nodes.length; i++) {
    const sp = nodes[i].span;
    if (sp && sp.s === tag.span.s && sp.e === tag.span.e) {
      if (nodes[i].label.startsWith(tag.label) || tag.label.startsWith(nodes[i].label)) return i;
      if (best < 0) best = i;
    }
  }
  return best;
}

// Renders the flattened AST as an indented list, highlighting the node at
// `curIdx` (the one currently being lowered) and dimming the rest.
function AstList({ nodes, curIdx, p }: { nodes: Flat[]; curIdx: number; p: Palette }) {
  return (
    <div>
      {nodes.map((nd, i) => {
        const isCur = i === curIdx;
        return (
          <div
            key={i}
            className="font-mono text-[11px] leading-relaxed"
            style={{
              paddingLeft: 6 + nd.depth * 14,
              color: isCur ? p.hlFg : nd.accent ? p.accent : "rgb(var(--zinc-300))",
              background: isCur ? rgba(CHOCO, 0.22) : "transparent",
              opacity: curIdx < 0 || isCur ? 1 : 0.55,
              borderRadius: 3,
            }}
          >
            {nd.label}
          </div>
        );
      })}
    </div>
  );
}

function AnimCodegenView({
  nodes,
  irLines,
  tags,
  step,
}: {
  nodes: Flat[];
  irLines: string[];
  tags: (IRTag | null)[];
  step: number;
}) {
  const p = palette(useIsLight());
  if (irLines.length === 0) {
    return <div className="font-mono text-xs text-zinc-600">— no IR emitted —</div>;
  }
  const n = Math.min(step, irLines.length - 1);
  const tag = tags[n] ?? null;
  const curIdx = tagNodeIndex(tag, nodes);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="text-zinc-500">lowering</span>
        <span className="rounded px-1.5 py-0.5" style={{ background: rgba(CHOCO, 0.14), color: p.accent }}>
          {tag ? tag.label : "module setup"}
        </span>
        <span className="text-zinc-600">→ IR</span>
      </div>
      <div className="border-t pt-2" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
        <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-zinc-600">LLVM IR (output)</div>
        <pre className="font-mono text-[11px] leading-relaxed">
          {irLines.slice(0, n + 1).map((l, i) => {
            const ti = tagNodeIndex(tags[i], nodes);
            const sameNode = curIdx >= 0 && ti === curIdx;
            return (
              <div
                key={i}
                className="flex"
                style={{
                  background: i === n ? rgba(CHOCO, 0.2) : sameNode ? rgba(CHOCO, 0.07) : "transparent",
                  borderRadius: 3,
                }}
              >
                <span className="mr-3 w-6 flex-shrink-0 select-none text-right text-zinc-700">{i + 1}</span>
                <span style={{ color: irLineColor(l, p), whiteSpace: "pre" }}>{l || " "}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
