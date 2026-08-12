# Yashas Kadambi — Six Interfaces

One resume, six domain-native interfaces. The same underlying content (bio, experience, projects, skills, metrics) is rendered through six interactive metaphors — pick the lens that matches how you think.

| Interface | Route | Metaphor |
|-----------|-------|----------|
| Production Systems | `/cluster` | A six-chapter production-systems narrative grounded in managed event integration, dependency-aware change, staged cutover and recovery, and software/hardware state reconciliation. |
| Operating Systems | `/kernel` | Boot to desktop — POST, `dmesg`, and a login drop you into a windowed OS whose apps are the resume: `htop` (projects), `systemctl` (career), `man yashas`, `/proc` (skills), `sched` (ghOSt), papers, and a shell (`panic` easter egg). |
| Web Development | `/devtools` | Chrome DevTools — Elements (DOM-tree bio), Network waterfall, a live Console REPL, Sources, and a Lighthouse audit. |
| Optical Systems | `/data-plane` | Data plane — line-card bringup, drivers probing the bus, a HAL stack, and live optical PM counters. |
| Backend Engineering | `/backend` | Agent control plane — dispatch an intent, approve the plan at a human gate, then watch apply and observe run; plus a diff of the manual way against what shipped, an event mesh, and a grounded RAG console. |
| Teaching Assistant | `/notebook` | Jupyter notebook — runnable cells that teach a concept, then reveal the artifact. |

A persistent switcher (bottom-right button or **⌘K / Ctrl+K**) hops between interfaces from anywhere. `/` is the launcher.

## Tech stack

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS
- Framer Motion for animation
- Lucide icons
- Static export (`output: "export"`) — deploys anywhere static

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

## Editing content

All content is data-driven — no CMS. Edit the TypeScript files in `src/data/`:

- `profile.ts` — name, tagline, summary, links
- `experience.ts` — the career timeline (used by every interface)
- `projects.ts` — projects (incl. `pid`/`cpu`/`mem`/`state` fields the kernel theme reads)
- `publications.ts` — papers
- `skills.ts` — skill groups
- `highlights.ts` — awards / notable facts
- `metrics.ts` — headline numbers

Themes are registered in `src/lib/themes.ts`; each theme's components live under `src/components/<theme>/`.

## Source documents

The CV, resume, LinkedIn export, credential evaluation and teaching artifacts that this
content was written from live in a separate **private** repository, wired in at
`source-documents/` as a submodule:

[`Yashas120/personal-site-reference`](https://github.com/Yashas120/personal-site-reference) *(access required)*

They are kept out of this repository because several contain PII. This repo stores only
the submodule's URL and commit SHA — never the documents themselves.

**Without access**, clone normally; everything except `source-documents/` checks out and the
site builds and deploys as usual:

```bash
git clone git@github.com:Yashas120/Yashas120.github.io.git
```

**With access**, pull the documents too:

```bash
git clone --recurse-submodules git@github.com:Yashas120/Yashas120.github.io.git
# or, in an existing clone:
git submodule update --init
```

Note that `--recurse-submodules` fails for anyone without access to the private repo, and
CI does not fetch it: `actions/checkout` leaves submodules off by default, so the Pages
build never touches `source-documents/`.

The `/cluster` content module contains publication-safe wording only. Employer-scale
figures and private review notes are excluded from source and client bundles rather
than stored behind rendering flags.

## Deploy

Static export is enabled, so push `./out` to any static host (Vercel, Netlify, GitHub Pages, S3+CloudFront).

```bash
npm run build && npx serve out
```
