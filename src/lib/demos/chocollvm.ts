// ChocoLLVM playground — a from-scratch, zero-dependency TypeScript
// re-implementation of the compiler frontend from
// https://github.com/Yashas120/chocollvm
//
// It lowers a subset of the ChocoPy language (a statically-typed subset of
// Python 3, https://chocopy.org) all the way to human-readable LLVM IR, and
// runs entirely in the browser: source -> tokens -> AST -> LLVM IR.
//
// Supported subset: global variable definitions, function definitions with
// typed params + return (including recursion), int/bool types, arithmetic
// (+ - * // %), comparisons, boolean and/or/not, if/elif/else, while,
// return, pass, and the print() builtin. No lists/strings/classes/nested defs.

// ------------------------------- tokens -------------------------------

export type TokKind =
  | "NEWLINE"
  | "INDENT"
  | "DEDENT"
  | "EOF"
  | "NUMBER"
  | "STRING"
  | "NAME"
  | "KEYWORD"
  | "OP";

export interface Token {
  kind: TokKind;
  value: string;
  line: number;
  col: number;
  start: number; // absolute char offset into the (normalized) source
  end: number;
}

// An ordered scan event used to animate the lexer sweeping the source.
export type LexEventType = "token" | "comment" | "indent" | "dedent" | "newline";
export interface LexEvent {
  type: LexEventType;
  start: number;
  end: number;
  label: string; // human caption, e.g. "keyword", "identifier", "skip comment"
  token?: Token;
}

function tokenLabel(kind: TokKind): string {
  switch (kind) {
    case "KEYWORD":
      return "keyword";
    case "NAME":
      return "identifier";
    case "NUMBER":
      return "number";
    case "STRING":
      return "string";
    case "OP":
      return "operator";
    default:
      return kind.toLowerCase();
  }
}

export class CompileError extends Error {
  line: number;
  constructor(message: string, line: number) {
    super(message);
    this.name = "CompileError";
    this.line = line;
  }
}

const KEYWORDS = new Set([
  "def", "if", "elif", "else", "while", "for", "in", "return", "pass",
  "and", "or", "not", "True", "False", "None", "global", "nonlocal",
  "class", "is",
]);

// multi-char operators, longest first
const OPS3 = ["//="];
const OPS2 = ["//", "==", "!=", "<=", ">=", "->", "+=", "-=", "*=", "%="];
const OPS1 = "+-*%()[]:,=<>.";

export interface LexResult {
  source: string; // normalized source (\n line endings)
  tokens: Token[];
  events: LexEvent[];
}

// Indentation-aware tokenizer (Python/ChocoPy style). Records absolute char
// offsets and an ordered event trace (tokens, skipped comments, indent/dedent,
// newline) so the UI can animate the scan across the source.
export function lex(src: string): LexResult {
  const source = src.replace(/\r\n?/g, "\n");
  const tokens: Token[] = [];
  const events: LexEvent[] = [];
  const indents: number[] = [0];
  const lines = source.split("\n");

  let lineStart = 0; // absolute offset of the current line's first char

  const push = (t: Token, label: string) => {
    tokens.push(t);
    events.push({ type: "token", start: t.start, end: t.end, label, token: t });
  };

  for (let ln = 0; ln < lines.length; ln++) {
    const raw = lines[ln];
    const lineNo = ln + 1;
    const base = lineStart;
    lineStart += raw.length + 1; // advance past this line + its \n for next iteration

    // measure indentation (spaces; tabs count as 8 for simplicity)
    let i = 0;
    let indent = 0;
    while (i < raw.length && (raw[i] === " " || raw[i] === "\t")) {
      indent += raw[i] === "\t" ? 8 : 1;
      i++;
    }
    const rest = raw.slice(i);

    // blank line — nothing to emit
    if (rest.trim() === "") continue;

    // full-line comment — show it being skipped, no indent effect
    if (rest.startsWith("#")) {
      events.push({ type: "comment", start: base + i, end: base + raw.length, label: "skip comment" });
      continue;
    }

    // emit INDENT / DEDENT
    const top = indents[indents.length - 1];
    if (indent > top) {
      indents.push(indent);
      tokens.push({ kind: "INDENT", value: "", line: lineNo, col: 1, start: base, end: base + i });
      events.push({ type: "indent", start: base, end: base + i, label: "indent" });
    } else if (indent < top) {
      while (indents.length > 1 && indent < indents[indents.length - 1]) {
        indents.pop();
        tokens.push({ kind: "DEDENT", value: "", line: lineNo, col: 1, start: base, end: base + i });
        events.push({ type: "dedent", start: base, end: base + i, label: "dedent" });
      }
      if (indents[indents.length - 1] !== indent) {
        throw new CompileError("inconsistent indentation", lineNo);
      }
    }

    // tokenize the line content
    let col = i;
    while (col < raw.length) {
      const c = raw[col];

      if (c === " " || c === "\t") {
        col++;
        continue;
      }
      if (c === "#") {
        events.push({ type: "comment", start: base + col, end: base + raw.length, label: "skip comment" });
        break;
      }

      // string literal
      if (c === '"') {
        let j = col + 1;
        let s = "";
        while (j < raw.length && raw[j] !== '"') {
          if (raw[j] === "\\" && j + 1 < raw.length) {
            const n = raw[j + 1];
            s += n === "n" ? "\n" : n === "t" ? "\t" : n;
            j += 2;
          } else {
            s += raw[j];
            j++;
          }
        }
        if (j >= raw.length) throw new CompileError("unterminated string", lineNo);
        push(
          { kind: "STRING", value: s, line: lineNo, col: col + 1, start: base + col, end: base + j + 1 },
          "string"
        );
        col = j + 1;
        continue;
      }

      // number
      if (c >= "0" && c <= "9") {
        let j = col;
        while (j < raw.length && raw[j] >= "0" && raw[j] <= "9") j++;
        push(
          { kind: "NUMBER", value: raw.slice(col, j), line: lineNo, col: col + 1, start: base + col, end: base + j },
          "number"
        );
        col = j;
        continue;
      }

      // identifier / keyword
      if (/[A-Za-z_]/.test(c)) {
        let j = col;
        while (j < raw.length && /[A-Za-z0-9_]/.test(raw[j])) j++;
        const word = raw.slice(col, j);
        const kind: TokKind = KEYWORDS.has(word) ? "KEYWORD" : "NAME";
        push({ kind, value: word, line: lineNo, col: col + 1, start: base + col, end: base + j }, tokenLabel(kind));
        col = j;
        continue;
      }

      // operators (longest match first)
      const three = raw.slice(col, col + 3);
      const two = raw.slice(col, col + 2);
      if (OPS3.includes(three)) {
        push({ kind: "OP", value: three, line: lineNo, col: col + 1, start: base + col, end: base + col + 3 }, "operator");
        col += 3;
        continue;
      }
      if (OPS2.includes(two)) {
        push({ kind: "OP", value: two, line: lineNo, col: col + 1, start: base + col, end: base + col + 2 }, "operator");
        col += 2;
        continue;
      }
      if (OPS1.includes(c)) {
        push({ kind: "OP", value: c, line: lineNo, col: col + 1, start: base + col, end: base + col + 1 }, "operator");
        col++;
        continue;
      }

      throw new CompileError(`unexpected character '${c}'`, lineNo);
    }

    const nlPos = base + raw.length;
    tokens.push({ kind: "NEWLINE", value: "", line: lineNo, col: raw.length + 1, start: nlPos, end: nlPos });
    events.push({ type: "newline", start: nlPos, end: nlPos + 1, label: "newline" });
  }

  // close remaining indents
  const lastLine = lines.length;
  const endPos = source.length;
  while (indents.length > 1) {
    indents.pop();
    tokens.push({ kind: "DEDENT", value: "", line: lastLine, col: 1, start: endPos, end: endPos });
    events.push({ type: "dedent", start: endPos, end: endPos, label: "dedent" });
  }
  tokens.push({ kind: "EOF", value: "", line: lastLine, col: 1, start: endPos, end: endPos });
  return { source, tokens, events };
}

export function tokenize(src: string): Token[] {
  return lex(src).tokens;
}

// ------------------------------- AST -------------------------------

export type TypeName = "int" | "bool" | "str" | "object" | "None";

// half-open range of token indices [s, e) that a node was parsed from
export interface TokenSpan {
  s: number;
  e: number;
}

type ExprNode =
  | { kind: "Num"; value: number }
  | { kind: "Bool"; value: boolean }
  | { kind: "Str"; value: string }
  | { kind: "Name"; id: string }
  | { kind: "Unary"; op: string; operand: Expr }
  | { kind: "Binary"; op: string; left: Expr; right: Expr }
  | { kind: "Compare"; op: string; left: Expr; right: Expr }
  | { kind: "BoolOp"; op: "and" | "or"; left: Expr; right: Expr }
  | { kind: "Call"; func: string; args: Expr[] };

export type Expr = ExprNode & { span?: TokenSpan };

export interface VarDef {
  kind: "VarDef";
  name: string;
  type: TypeName;
  value: Expr;
  span?: TokenSpan;
}

type StmtNode =
  | VarDef
  | { kind: "Assign"; name: string; value: Expr }
  | { kind: "ExprStmt"; expr: Expr }
  | { kind: "If"; cond: Expr; body: Stmt[]; orelse: Stmt[] }
  | { kind: "While"; cond: Expr; body: Stmt[] }
  | { kind: "Return"; value: Expr | null }
  | { kind: "Pass" }
  | { kind: "Global"; name: string };

export type Stmt = StmtNode & { span?: TokenSpan };

export interface Param {
  name: string;
  type: TypeName;
}

export interface FuncDef {
  kind: "FuncDef";
  name: string;
  params: Param[];
  ret: TypeName;
  locals: VarDef[];
  body: Stmt[];
  span?: TokenSpan;
}

export interface Program {
  globals: VarDef[];
  funcs: FuncDef[];
  main: Stmt[];
}

// ------------------------------- parser -------------------------------

class Parser {
  private p = 0;
  private toks: Token[];
  constructor(toks: Token[]) {
    this.toks = toks;
  }

  private peek(o = 0): Token {
    return this.toks[Math.min(this.p + o, this.toks.length - 1)];
  }
  private next(): Token {
    return this.toks[this.p++];
  }
  private at(kind: TokKind, value?: string): boolean {
    const t = this.peek();
    return t.kind === kind && (value === undefined || t.value === value);
  }
  private eat(kind: TokKind, value?: string): Token {
    const t = this.peek();
    if (t.kind !== kind || (value !== undefined && t.value !== value)) {
      const want = value !== undefined ? `'${value}'` : kind;
      throw new CompileError(`expected ${want} but found '${t.value || t.kind}'`, t.line);
    }
    return this.next();
  }
  private skipNewlines() {
    while (this.at("NEWLINE")) this.next();
  }
  // attach the token span [s0, current) to a freshly created node
  private fin<T>(s0: number, node: T): T {
    (node as unknown as { span?: TokenSpan }).span = { s: s0, e: this.p };
    return node;
  }

  parseProgram(): Program {
    const globals: Program["globals"] = [];
    const funcs: FuncDef[] = [];
    const main: Stmt[] = [];

    this.skipNewlines();
    while (!this.at("EOF")) {
      if (this.at("KEYWORD", "def")) {
        funcs.push(this.parseFuncDef());
      } else if (this.isVarDef()) {
        globals.push(this.parseVarDef());
      } else {
        main.push(this.parseStatement());
      }
      this.skipNewlines();
    }
    return { globals, funcs, main };
  }

  private isVarDef(): boolean {
    return this.at("NAME") && this.peek(1).kind === "OP" && this.peek(1).value === ":";
  }

  private parseType(): TypeName {
    const t = this.eat("NAME");
    if (t.value !== "int" && t.value !== "bool" && t.value !== "str" && t.value !== "object") {
      throw new CompileError(`unknown type '${t.value}'`, t.line);
    }
    return t.value as TypeName;
  }

  private parseVarDef(): VarDef {
    const s0 = this.p;
    const name = this.eat("NAME").value;
    this.eat("OP", ":");
    const type = this.parseType();
    this.eat("OP", "=");
    const value = this.parseExpr();
    this.eat("NEWLINE");
    return this.fin(s0, { kind: "VarDef", name, type, value });
  }

  private parseFuncDef(): FuncDef {
    const s0 = this.p;
    this.eat("KEYWORD", "def");
    const name = this.eat("NAME").value;
    this.eat("OP", "(");
    const params: Param[] = [];
    if (!this.at("OP", ")")) {
      do {
        const pn = this.eat("NAME").value;
        this.eat("OP", ":");
        const pt = this.parseType();
        params.push({ name: pn, type: pt });
      } while (this.at("OP", ",") && this.next());
    }
    this.eat("OP", ")");
    let ret: TypeName = "None";
    if (this.at("OP", "->")) {
      this.next();
      ret = this.parseType();
    }
    this.eat("OP", ":");
    this.eat("NEWLINE");
    this.eat("INDENT");

    const locals: FuncDef["locals"] = [];
    while (this.isVarDef()) locals.push(this.parseVarDef());
    const body: Stmt[] = [];
    while (!this.at("DEDENT") && !this.at("EOF")) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    this.eat("DEDENT");
    return this.fin(s0, { kind: "FuncDef", name, params, ret, locals, body });
  }

  private parseBlock(): Stmt[] {
    this.eat("OP", ":");
    this.eat("NEWLINE");
    this.eat("INDENT");
    const body: Stmt[] = [];
    while (!this.at("DEDENT") && !this.at("EOF")) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    this.eat("DEDENT");
    return body;
  }

  private parseStatement(): Stmt {
    const s0 = this.p;
    if (this.at("KEYWORD", "if")) return this.parseIf();
    if (this.at("KEYWORD", "while")) {
      this.next();
      const cond = this.parseExpr();
      const body = this.parseBlock();
      return this.fin(s0, { kind: "While", cond, body });
    }
    if (this.at("KEYWORD", "return")) {
      this.next();
      let value: Expr | null = null;
      if (!this.at("NEWLINE")) value = this.parseExpr();
      this.eat("NEWLINE");
      return this.fin(s0, { kind: "Return", value });
    }
    if (this.at("KEYWORD", "pass")) {
      this.next();
      this.eat("NEWLINE");
      return this.fin(s0, { kind: "Pass" });
    }
    if (this.at("KEYWORD", "global")) {
      this.next();
      const name = this.eat("NAME").value;
      this.eat("NEWLINE");
      return this.fin(s0, { kind: "Global", name });
    }
    if (this.isVarDef()) return this.parseVarDef();

    // assignment or expression statement
    const expr = this.parseExpr();
    if (this.at("OP", "=")) {
      this.next();
      if (expr.kind !== "Name") {
        throw new CompileError("invalid assignment target", this.peek().line);
      }
      const value = this.parseExpr();
      this.eat("NEWLINE");
      return this.fin(s0, { kind: "Assign", name: expr.id, value });
    }
    this.eat("NEWLINE");
    return this.fin(s0, { kind: "ExprStmt", expr });
  }

  private parseIf(): Stmt {
    const s0 = this.p;
    this.eat("KEYWORD", "if");
    const cond = this.parseExpr();
    const body = this.parseBlock();
    let orelse: Stmt[] = [];
    if (this.at("KEYWORD", "elif")) {
      // rewrite `elif` as a nested if
      const t = this.peek();
      this.toks[this.p] = { ...t, value: "if" };
      orelse = [this.parseIf()];
    } else if (this.at("KEYWORD", "else")) {
      this.next();
      orelse = this.parseBlock();
    }
    return this.fin(s0, { kind: "If", cond, body, orelse });
  }

  // expression precedence ------------------------------------------------
  private parseExpr(): Expr {
    return this.parseOr();
  }
  private parseOr(): Expr {
    const s0 = this.p;
    let left = this.parseAnd();
    while (this.at("KEYWORD", "or")) {
      this.next();
      left = this.fin(s0, { kind: "BoolOp", op: "or", left, right: this.parseAnd() });
    }
    return left;
  }
  private parseAnd(): Expr {
    const s0 = this.p;
    let left = this.parseNot();
    while (this.at("KEYWORD", "and")) {
      this.next();
      left = this.fin(s0, { kind: "BoolOp", op: "and", left, right: this.parseNot() });
    }
    return left;
  }
  private parseNot(): Expr {
    const s0 = this.p;
    if (this.at("KEYWORD", "not")) {
      this.next();
      return this.fin(s0, { kind: "Unary", op: "not", operand: this.parseNot() });
    }
    return this.parseComparison();
  }
  private parseComparison(): Expr {
    const s0 = this.p;
    let left = this.parseAdd();
    const cmp = ["==", "!=", "<", "<=", ">", ">="];
    if (this.at("OP") && cmp.includes(this.peek().value)) {
      const op = this.next().value;
      const right = this.parseAdd();
      left = this.fin(s0, { kind: "Compare", op, left, right });
    }
    return left;
  }
  private parseAdd(): Expr {
    const s0 = this.p;
    let left = this.parseMul();
    while (this.at("OP", "+") || this.at("OP", "-")) {
      const op = this.next().value;
      left = this.fin(s0, { kind: "Binary", op, left, right: this.parseMul() });
    }
    return left;
  }
  private parseMul(): Expr {
    const s0 = this.p;
    let left = this.parseUnary();
    while (this.at("OP", "*") || this.at("OP", "//") || this.at("OP", "%")) {
      const op = this.next().value;
      left = this.fin(s0, { kind: "Binary", op, left, right: this.parseUnary() });
    }
    return left;
  }
  private parseUnary(): Expr {
    const s0 = this.p;
    if (this.at("OP", "-")) {
      this.next();
      return this.fin(s0, { kind: "Unary", op: "-", operand: this.parseUnary() });
    }
    return this.parseAtom();
  }
  private parseAtom(): Expr {
    const s0 = this.p;
    const t = this.peek();
    if (t.kind === "NUMBER") {
      this.next();
      return this.fin(s0, { kind: "Num", value: parseInt(t.value, 10) });
    }
    if (t.kind === "STRING") {
      this.next();
      return this.fin(s0, { kind: "Str", value: t.value });
    }
    if (t.kind === "KEYWORD" && (t.value === "True" || t.value === "False")) {
      this.next();
      return this.fin(s0, { kind: "Bool", value: t.value === "True" });
    }
    if (t.kind === "OP" && t.value === "(") {
      this.next();
      const e = this.parseExpr();
      this.eat("OP", ")");
      return this.fin(s0, e);
    }
    if (t.kind === "NAME") {
      this.next();
      if (this.at("OP", "(")) {
        this.next();
        const args: Expr[] = [];
        if (!this.at("OP", ")")) {
          do {
            args.push(this.parseExpr());
          } while (this.at("OP", ",") && this.next());
        }
        this.eat("OP", ")");
        return this.fin(s0, { kind: "Call", func: t.value, args });
      }
      return this.fin(s0, { kind: "Name", id: t.value });
    }
    throw new CompileError(`unexpected '${t.value || t.kind}'`, t.line);
  }
}

export function parse(tokens: Token[]): Program {
  return new Parser(tokens).parseProgram();
}

// ------------------------------- codegen -------------------------------

interface Sym {
  ll: string; // LLVM pointer operand, e.g. @x or %x.addr
  type: TypeName;
}

// which AST node an emitted IR line came from (drives the codegen animation)
export interface IRTag {
  label: string;
  span?: TokenSpan;
}

interface TaggedLine {
  text: string;
  tag: IRTag | null;
}

const llType = (t: TypeName): string => (t === "bool" ? "i1" : "i32");

function stmtTagLabel(s: Stmt): string {
  switch (s.kind) {
    case "VarDef":
      return `VarDef ${s.name}`;
    case "Assign":
      return `Assign ${s.name}`;
    case "ExprStmt":
      return "ExprStmt";
    case "If":
      return "If";
    case "While":
      return "While";
    case "Return":
      return "Return";
    case "Pass":
      return "Pass";
    case "Global":
      return `Global ${s.name}`;
  }
}

function exprTagLabel(e: Expr): string {
  switch (e.kind) {
    case "Num":
      return `Num ${e.value}`;
    case "Bool":
      return `Bool ${e.value}`;
    case "Str":
      return "Str";
    case "Name":
      return `Name ${e.id}`;
    case "Unary":
      return `Unary ${e.op}`;
    case "Binary":
      return `Binary ${e.op}`;
    case "Compare":
      return `Compare ${e.op}`;
    case "BoolOp":
      return `BoolOp ${e.op}`;
    case "Call":
      return `Call ${e.func}`;
  }
}

class Codegen {
  private out: TaggedLine[] = [];
  private globals: TaggedLine[] = [];
  private lines: TaggedLine[] = [];
  private tmp = 0;
  private lbl = 0;
  private terminated = false;
  private scope: Map<string, Sym> = new Map();
  private globalScope: Map<string, Sym> = new Map();
  private funcRet: Map<string, TypeName> = new Map();
  private tagStack: IRTag[] = [];
  private prog: Program;

  constructor(prog: Program) {
    this.prog = prog;
    for (const f of prog.funcs) this.funcRet.set(f.name, f.ret);
    for (const g of prog.globals) {
      this.globalScope.set(g.name, { ll: `@${g.name}`, type: g.type });
    }
  }

  private fresh(): string {
    return `%t${this.tmp++}`;
  }
  private label(base: string): string {
    return `${base}${this.lbl++}`;
  }
  private curTag(): IRTag | null {
    return this.tagStack.length ? this.tagStack[this.tagStack.length - 1] : null;
  }
  private emit(s: string) {
    if (this.terminated) return;
    this.lines.push({ text: "  " + s, tag: this.curTag() });
  }
  private startBlock(l: string) {
    this.lines.push({ text: `${l}:`, tag: this.curTag() });
    this.terminated = false;
  }
  private term(s: string) {
    if (this.terminated) return;
    this.lines.push({ text: "  " + s, tag: this.curTag() });
    this.terminated = true;
  }

  private lookup(name: string): Sym {
    return this.scope.get(name) ?? this.globalScope.get(name) ?? this.err(`undefined name '${name}'`);
  }
  private err(msg: string): never {
    throw new CompileError(msg, 0);
  }

  generate(): { ir: string; tags: (IRTag | null)[] } {
    const header: IRTag = { label: "module header" };
    this.out.push({ text: "; ModuleID = 'chocollvm'", tag: header });
    this.out.push({ text: 'source_filename = "chocollvm"', tag: header });
    this.out.push({ text: "", tag: null });
    this.out.push({ text: "declare i32 @printf(i8*, ...)", tag: header });
    this.out.push({ text: "", tag: null });

    const rt: IRTag = { label: "runtime strings" };
    this.globals.push({ text: '@.fmt_int = private unnamed_addr constant [4 x i8] c"%d\\0A\\00"', tag: rt });
    this.globals.push({ text: '@.fmt_str = private unnamed_addr constant [4 x i8] c"%s\\0A\\00"', tag: rt });
    this.globals.push({ text: '@.str_true = private unnamed_addr constant [5 x i8] c"True\\00"', tag: rt });
    this.globals.push({ text: '@.str_false = private unnamed_addr constant [6 x i8] c"False\\00"', tag: rt });

    // global variables
    for (const g of this.prog.globals) {
      if (g.type === "str") continue; // strings not supported as globals here
      const v = this.constValue(g.value, g.type);
      this.globals.push({
        text: `@${g.name} = global ${llType(g.type)} ${v}`,
        tag: { label: `VarDef ${g.name}`, span: g.span },
      });
    }

    // functions
    for (const f of this.prog.funcs) this.genFunc(f);

    // main
    this.genMain();

    const all: TaggedLine[] = [...this.out, { text: "", tag: null }, ...this.globals];
    const ir = all.map((l) => l.text).join("\n") + "\n";
    return { ir, tags: all.map((l) => l.tag) };
  }

  private constValue(e: Expr, t: TypeName): string {
    if (e.kind === "Num") return String(e.value);
    if (e.kind === "Bool") return e.value ? "true" : "false";
    if (e.kind === "Unary" && e.op === "-" && e.operand.kind === "Num") return String(-e.operand.value);
    // fall back to 0 / false for non-literal global initializers
    return t === "bool" ? "false" : "0";
  }

  private beginFunction() {
    this.lines = [];
    this.tmp = 0;
    this.lbl = 0;
    this.terminated = false;
  }

  private genFunc(f: FuncDef) {
    this.beginFunction();
    this.scope = new Map();
    const fnTag: IRTag = { label: `define @${f.name}`, span: f.span };
    this.tagStack.push(fnTag);

    const paramSig = f.params.map((p, i) => `${llType(p.type)} %arg${i}`).join(", ");
    this.startBlock("entry");

    // materialize params into allocas
    f.params.forEach((p, i) => {
      const addr = `%${p.name}.addr`;
      this.emit(`${addr} = alloca ${llType(p.type)}`);
      this.emit(`store ${llType(p.type)} %arg${i}, ${llType(p.type)}* ${addr}`);
      this.scope.set(p.name, { ll: addr, type: p.type });
    });

    // local variable definitions
    for (const v of f.locals) {
      this.tagStack.push({ label: `VarDef ${v.name}`, span: v.span });
      const addr = `%${v.name}.addr`;
      this.emit(`${addr} = alloca ${llType(v.type)}`);
      const val = this.genExpr(v.value);
      this.emit(`store ${llType(v.type)} ${val.v}, ${llType(v.type)}* ${addr}`);
      this.scope.set(v.name, { ll: addr, type: v.type });
      this.tagStack.pop();
    }

    for (const s of f.body) this.genStmt(s);

    // default return
    if (!this.terminated) {
      this.term(f.ret === "None" ? "ret void" : `ret ${llType(f.ret)} ${f.ret === "bool" ? "false" : "0"}`);
    }
    this.tagStack.pop();

    const retSig = f.ret === "None" ? "void" : llType(f.ret);
    this.out.push({ text: `define ${retSig} @${f.name}(${paramSig}) {`, tag: fnTag });
    this.out.push(...this.lines);
    this.out.push({ text: "}", tag: fnTag });
    this.out.push({ text: "", tag: null });
    this.scope = new Map();
  }

  private genMain() {
    this.beginFunction();
    this.scope = new Map();
    const fnTag: IRTag = { label: "define @main" };
    this.tagStack.push(fnTag);
    this.startBlock("entry");
    for (const s of this.prog.main) this.genStmt(s);
    if (!this.terminated) this.term("ret i32 0");
    this.tagStack.pop();
    this.out.push({ text: "define i32 @main() {", tag: fnTag });
    this.out.push(...this.lines);
    this.out.push({ text: "}", tag: fnTag });
  }

  // tag every IR line a statement emits with that statement's AST node
  private genStmt(s: Stmt) {
    if (this.terminated) return;
    this.tagStack.push({ label: stmtTagLabel(s), span: s.span });
    this.genStmtInner(s);
    this.tagStack.pop();
  }

  private genStmtInner(s: Stmt) {
    switch (s.kind) {
      case "Pass":
      case "Global":
        return;
      case "VarDef": {
        // local var def encountered inside a block
        const addr = `%${s.name}.addr`;
        this.emit(`${addr} = alloca ${llType(s.type)}`);
        const val = this.genExpr(s.value);
        this.emit(`store ${llType(s.type)} ${val.v}, ${llType(s.type)}* ${addr}`);
        this.scope.set(s.name, { ll: addr, type: s.type });
        return;
      }
      case "Assign": {
        const sym = this.lookup(s.name);
        const val = this.genExpr(s.value);
        this.emit(`store ${llType(sym.type)} ${val.v}, ${llType(sym.type)}* ${sym.ll}`);
        return;
      }
      case "ExprStmt":
        this.genExpr(s.expr);
        return;
      case "Return":
        if (s.value) {
          const v = this.genExpr(s.value);
          this.term(`ret ${llType(v.t)} ${v.v}`);
        } else {
          this.term("ret void");
        }
        return;
      case "If": {
        const c = this.genExpr(s.cond);
        const thenL = this.label("then");
        const endL = this.label("endif");
        const elseL = s.orelse.length ? this.label("else") : endL;
        this.term(`br i1 ${c.v}, label %${thenL}, label %${elseL}`);

        this.startBlock(thenL);
        for (const st of s.body) this.genStmt(st);
        if (!this.terminated) this.term(`br label %${endL}`);

        if (s.orelse.length) {
          this.startBlock(elseL);
          for (const st of s.orelse) this.genStmt(st);
          if (!this.terminated) this.term(`br label %${endL}`);
        }

        this.startBlock(endL);
        return;
      }
      case "While": {
        const condL = this.label("while.cond");
        const bodyL = this.label("while.body");
        const endL = this.label("while.end");
        this.term(`br label %${condL}`);
        this.startBlock(condL);
        const c = this.genExpr(s.cond);
        this.term(`br i1 ${c.v}, label %${bodyL}, label %${endL}`);
        this.startBlock(bodyL);
        for (const st of s.body) this.genStmt(st);
        if (!this.terminated) this.term(`br label %${condL}`);
        this.startBlock(endL);
        return;
      }
    }
  }

  // tag every IR line an expression emits with that expression's AST node
  private genExpr(e: Expr): { v: string; t: TypeName } {
    this.tagStack.push({ label: exprTagLabel(e), span: e.span });
    const r = this.genExprInner(e);
    this.tagStack.pop();
    return r;
  }

  private genExprInner(e: Expr): { v: string; t: TypeName } {
    switch (e.kind) {
      case "Num":
        return { v: String(e.value), t: "int" };
      case "Bool":
        return { v: e.value ? "true" : "false", t: "bool" };
      case "Str":
        return this.err("string values are not supported in this playground");
      case "Name": {
        const sym = this.lookup(e.id);
        const t = this.fresh();
        this.emit(`${t} = load ${llType(sym.type)}, ${llType(sym.type)}* ${sym.ll}`);
        return { v: t, t: sym.type };
      }
      case "Unary": {
        if (e.op === "not") {
          const o = this.genExpr(e.operand);
          const t = this.fresh();
          this.emit(`${t} = xor i1 ${o.v}, true`);
          return { v: t, t: "bool" };
        }
        // negation
        const o = this.genExpr(e.operand);
        const t = this.fresh();
        this.emit(`${t} = sub i32 0, ${o.v}`);
        return { v: t, t: "int" };
      }
      case "Binary": {
        // ChocoPy // and % are *floor* division/modulo (like Python), which
        // differ from LLVM's truncating sdiv/srem for negative operands.
        if (e.op === "//") return this.genFloorDiv(e);
        if (e.op === "%") return this.genFloorMod(e);
        const a = this.genExpr(e.left);
        const b = this.genExpr(e.right);
        const opMap: Record<string, string> = { "+": "add", "-": "sub", "*": "mul" };
        const t = this.fresh();
        this.emit(`${t} = ${opMap[e.op]} i32 ${a.v}, ${b.v}`);
        return { v: t, t: "int" };
      }
      case "Compare": {
        const a = this.genExpr(e.left);
        const b = this.genExpr(e.right);
        const predMap: Record<string, string> = {
          "==": "eq",
          "!=": "ne",
          "<": "slt",
          "<=": "sle",
          ">": "sgt",
          ">=": "sge",
        };
        const t = this.fresh();
        this.emit(`${t} = icmp ${predMap[e.op]} i32 ${a.v}, ${b.v}`);
        return { v: t, t: "bool" };
      }
      case "BoolOp":
        return this.genBoolOp(e);
      case "Call":
        return this.genCall(e);
    }
  }

  // floor division: q = sdiv; if remainder nonzero and signs differ, q -= 1
  private genFloorDiv(e: Extract<Expr, { kind: "Binary" }>): { v: string; t: TypeName } {
    const a = this.genExpr(e.left);
    const b = this.genExpr(e.right);
    const q = this.fresh();
    this.emit(`${q} = sdiv i32 ${a.v}, ${b.v}`);
    const r = this.fresh();
    this.emit(`${r} = srem i32 ${a.v}, ${b.v}`);
    const rnz = this.fresh();
    this.emit(`${rnz} = icmp ne i32 ${r}, 0`);
    const rneg = this.fresh();
    this.emit(`${rneg} = icmp slt i32 ${r}, 0`);
    const bneg = this.fresh();
    this.emit(`${bneg} = icmp slt i32 ${b.v}, 0`);
    const diff = this.fresh();
    this.emit(`${diff} = xor i1 ${rneg}, ${bneg}`);
    const adj = this.fresh();
    this.emit(`${adj} = and i1 ${rnz}, ${diff}`);
    const qm1 = this.fresh();
    this.emit(`${qm1} = sub i32 ${q}, 1`);
    const res = this.fresh();
    this.emit(`${res} = select i1 ${adj}, i32 ${qm1}, i32 ${q}`);
    return { v: res, t: "int" };
  }

  // floor modulo: r = srem; if r nonzero and signs differ, r += b
  private genFloorMod(e: Extract<Expr, { kind: "Binary" }>): { v: string; t: TypeName } {
    const a = this.genExpr(e.left);
    const b = this.genExpr(e.right);
    const r = this.fresh();
    this.emit(`${r} = srem i32 ${a.v}, ${b.v}`);
    const rnz = this.fresh();
    this.emit(`${rnz} = icmp ne i32 ${r}, 0`);
    const rneg = this.fresh();
    this.emit(`${rneg} = icmp slt i32 ${r}, 0`);
    const bneg = this.fresh();
    this.emit(`${bneg} = icmp slt i32 ${b.v}, 0`);
    const diff = this.fresh();
    this.emit(`${diff} = xor i1 ${rneg}, ${bneg}`);
    const adj = this.fresh();
    this.emit(`${adj} = and i1 ${rnz}, ${diff}`);
    const rpb = this.fresh();
    this.emit(`${rpb} = add i32 ${r}, ${b.v}`);
    const res = this.fresh();
    this.emit(`${res} = select i1 ${adj}, i32 ${rpb}, i32 ${r}`);
    return { v: res, t: "int" };
  }

  // short-circuiting and/or, lowered to branches with a stack slot for the result
  private genBoolOp(e: Extract<Expr, { kind: "BoolOp" }>): { v: string; t: TypeName } {
    const addr = `${this.fresh()}.addr`;
    this.emit(`${addr} = alloca i1`);
    const a = this.genExpr(e.left);
    this.emit(`store i1 ${a.v}, i1* ${addr}`);
    const rhsL = this.label(e.op === "and" ? "and.rhs" : "or.rhs");
    const endL = this.label(e.op === "and" ? "and.end" : "or.end");
    // `and`: evaluate rhs only if lhs is true; `or`: only if lhs is false
    if (e.op === "and") {
      this.term(`br i1 ${a.v}, label %${rhsL}, label %${endL}`);
    } else {
      this.term(`br i1 ${a.v}, label %${endL}, label %${rhsL}`);
    }
    this.startBlock(rhsL);
    const b = this.genExpr(e.right);
    this.emit(`store i1 ${b.v}, i1* ${addr}`);
    this.term(`br label %${endL}`);
    this.startBlock(endL);
    const res = this.fresh();
    this.emit(`${res} = load i1, i1* ${addr}`);
    return { v: res, t: "bool" };
  }

  private genCall(e: Extract<Expr, { kind: "Call" }>): { v: string; t: TypeName } {
    if (e.func === "print") {
      const arg = this.genExpr(e.args[0]);
      if (arg.t === "bool") {
        const s = this.fresh();
        this.emit(
          `${s} = select i1 ${arg.v}, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.str_true, i64 0, i64 0), i8* getelementptr inbounds ([6 x i8], [6 x i8]* @.str_false, i64 0, i64 0)`
        );
        this.emit(
          `call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* ${s})`
        );
      } else {
        this.emit(
          `call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_int, i64 0, i64 0), i32 ${arg.v})`
        );
      }
      return { v: "0", t: "int" };
    }

    const ret = this.funcRet.get(e.func);
    if (ret === undefined) this.err(`call to undefined function '${e.func}'`);
    const args = e.args.map((a) => this.genExpr(a));
    const argSig = args.map((a) => `${llType(a.t)} ${a.v}`).join(", ");
    if (ret === "None") {
      this.emit(`call void @${e.func}(${argSig})`);
      return { v: "0", t: "int" };
    }
    const t = this.fresh();
    this.emit(`${t} = call ${llType(ret)} @${e.func}(${argSig})`);
    return { v: t, t: ret };
  }
}

export function generateIR(prog: Program): string {
  return new Codegen(prog).generate().ir;
}

export function generateIRTagged(prog: Program): { ir: string; tags: (IRTag | null)[] } {
  return new Codegen(prog).generate();
}

// ------------------------------- driver -------------------------------

export type CompilePhase = "lex" | "parse" | "codegen";

export interface CompileResult {
  tokens: Token[];
  ast: Program | null;
  ir: string | null;
  error: string | null;
  errorLine: number | null;
  errorPhase: CompilePhase | null;
}

export function compile(src: string): CompileResult {
  const t = buildTrace(src);
  return {
    tokens: t.tokens,
    ast: t.ast,
    ir: t.ir,
    error: t.error,
    errorLine: t.errorLine,
    errorPhase: t.errorPhase,
  };
}

// A full trace of a compilation, carrying everything needed to *animate* the
// pipeline: the normalized source, the ordered lex scan events, tokens, AST,
// and the emitted IR (split into lines).
export interface Trace {
  source: string;
  events: LexEvent[];
  tokens: Token[];
  ast: Program | null;
  ir: string | null;
  irLines: string[];
  irTags: (IRTag | null)[];
  error: string | null;
  errorLine: number | null;
  errorPhase: CompilePhase | null;
}

export function buildTrace(src: string): Trace {
  const empty: Trace = {
    source: src.replace(/\r\n?/g, "\n"),
    events: [],
    tokens: [],
    ast: null,
    ir: null,
    irLines: [],
    irTags: [],
    error: null,
    errorLine: null,
    errorPhase: null,
  };

  let lexed: LexResult;
  try {
    lexed = lex(src);
  } catch (e) {
    const ce = e as CompileError;
    return { ...empty, error: ce.message, errorLine: ce.line ?? null, errorPhase: "lex" };
  }

  const base = { ...empty, source: lexed.source, events: lexed.events, tokens: lexed.tokens };

  let ast: Program;
  try {
    ast = parse(lexed.tokens);
  } catch (e) {
    const ce = e as CompileError;
    return { ...base, error: ce.message, errorLine: ce.line ?? null, errorPhase: "parse" };
  }

  try {
    const { ir, tags } = generateIRTagged(ast);
    return { ...base, ast, ir, irLines: ir.replace(/\n$/, "").split("\n"), irTags: tags };
  } catch (e) {
    const ce = e as CompileError;
    return { ...base, ast, error: ce.message, errorLine: ce.line ?? null, errorPhase: "codegen" };
  }
}

// ------------------------------- examples -------------------------------

export const EXAMPLES: { name: string; source: string }[] = [
  {
    name: "sum of squares",
    source: `# sum of the first n squares
def square(x: int) -> int:
    return x * x

n: int = 5
total: int = 0
i: int = 1
while i <= n:
    total = total + square(i)
    i = i + 1
print(total)
`,
  },
  {
    name: "fibonacci",
    source: `# recursive fibonacci
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(10))
`,
  },
  {
    name: "primality test",
    source: `# is n prime?
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    i: int = 2
    while i * i <= n:
        if n % i == 0:
            return False
        i = i + 1
    return True

print(is_prime(97))
`,
  },
];
