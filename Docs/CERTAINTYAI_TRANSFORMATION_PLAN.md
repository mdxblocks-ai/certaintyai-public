# CertaintyAI — Transformation Plan

**Plan Date:** 2026-06-12
**Branch:** `feature/agent-builder`
**Status:** Planning artifact only. No code modifications.
**Companion document:** `Docs/PROJECT_AUDIT.md`

---

## 0. North Star

> **New positioning:** *Open Architecture for Governed Agentic AI*
> **Tagline (preserved):** *Defensible AI for regulated industries*
> **Maker (preserved):** by **MDxBlocks Inc.**

CertaintyAI is repositioned from "the AI Readiness assessment tool" → "the **open architecture** an enterprise stands up to run governed agentic AI." The AI Readiness Assessment becomes a flagship use case and a free top-of-funnel motion, not the only door into the product.

### Hard constraints
1. Preserve existing branding (logo mark, parchment + dark theme tokens, name, sub/trademark).
2. Preserve existing functionality (no features removed; some surfaces relocated).
3. Preserve the **AI Readiness Assessment** end-to-end.
4. Preserve the **Agent Builder** end-to-end.
5. Preserve the **Control Tower** surface.
6. **AI Readiness is now optional** — one of several entry points, never a wall.
7. **Open Architecture** is the primary differentiator, framed as a 7-step narrative.

### Homepage narrative chain (preserved verbatim)
```
Open Architecture
   ↓
Ontology Intelligence Fabric
   ↓
Governance & Trust Layer
   ↓
Multi-Agent Orchestration
   ↓
Domain AI Copilots
   ↓
AI Control Tower
   ↓
Business Outcomes
```

This chain is the **single organizing principle** for marketing pages, navigation, content hierarchy, and the in-product console — so a visitor's mental model never resets between marketing and app.

---

## 1. New Sitemap

Two clear realms — **Marketing site** (public, anonymous, sales/SEO surface) and **Console** (authenticated, the working product). One repo, one React app, two URL prefixes (`/` and `/app`).

### 1.1 Marketing site (public)

```
/                                        Open Architecture homepage (7-step narrative)
│
├── /platform                            Platform overview (the chain, expanded)
│   ├── /platform/open-architecture      What "open architecture" means here
│   ├── /platform/ontology               Ontology Intelligence Fabric (Layer 3/4)
│   ├── /platform/governance             Governance & Trust Layer (Layer 5)
│   ├── /platform/orchestration          Multi-Agent Orchestration (ADK · A2A · MCP)
│   ├── /platform/copilots               Domain AI Copilots (Agent Builder, public)
│   ├── /platform/control-tower          AI Control Tower (public)
│   └── /platform/outcomes               Business Outcomes (case patterns, ROI)
│
├── /solutions                           By buyer / by industry
│   ├── /solutions/healthcare
│   ├── /solutions/bfsi
│   ├── /solutions/cybersecurity
│   ├── /solutions/education
│   ├── /solutions/government
│   └── /solutions/ai-readiness          AI Readiness Assessment as a Solution
│
├── /architecture                        3D isometric SVG stack (existing) — kept as primary asset
├── /docs                                Open standards & developer docs
│   ├── /docs/ontology                   Vocabulary spec
│   ├── /docs/a2a                        Agent-to-Agent integration guide
│   ├── /docs/mcp                        MCP tools reference
│   ├── /docs/evidence-pack              Provenance contract
│   └── /docs/deployment                 Marketplace + Helm + Snowflake Native App
│
├── /pricing                             Assess (free) · Govern (team) · Marketplace (enterprise)
├── /trust                               Security, compliance, honesty contract
├── /company                             About MDxBlocks
├── /survey                              ⟶ alias preserved; redirects to /solutions/ai-readiness/start
├── /report/:token                       Public anonymous report viewer (preserved)
├── /foundry                             Industry Foundry (preserved; reframed)
├── /login                               (preserved)
└── /signup                              (preserved)
```

### 1.2 Authenticated console (`/app`)

```
/app                                     Console root (redirects to /app/home)
│
├── /app/home                            Workspace home — entry tiles for any path
├── /app/control-tower                   AI Control Tower (preserved tab → first-class route)
├── /app/copilots                        Agent / Copilot library (Agent Builder, renamed surface)
│   ├── /app/copilots/library            List view (was AgentBuilder library view)
│   ├── /app/copilots/build              Builder view
│   └── /app/copilots/:id/runs           Run history & traces
├── /app/ontology                        Ontology browser (NEW — first-class)
├── /app/readiness                       AI Readiness Wizard (preserved, now optional)
├── /app/reports                         Saved reports (preserved)
├── /app/observability                   LLM observatory / portfolio observability (preserved sub-tab → route)
├── /app/integrations                    System integrations (preserved tab → route)
├── /app/plugins                         Plugin marketplace (preserved; honest "Coming soon" gating)
├── /app/insights                        Industry benchmarks (preserved)
└── /app/settings                        Account, team, security, billing
```

### 1.3 Compatibility shims (no link rot)

| Old | New |
|---|---|
| `/dashboard` | `/app/home` (redirect) |
| `/dashboard?tab=home` | `/app/home` |
| `/dashboard?tab=dashboard` | `/app/observability` (the AI Readiness Dashboard) |
| `/dashboard?tab=readiness` | `/app/readiness` |
| `/dashboard?tab=reports` | `/app/reports` |
| `/dashboard?tab=agent-builder` | `/app/copilots` |
| `/dashboard?tab=control-tower` | `/app/control-tower` |
| `/dashboard?tab=integrations` | `/app/integrations` |
| `/dashboard?tab=settings` | `/app/settings` |
| `/agent-builder` | `/app/copilots` |
| `/survey` | `/solutions/ai-readiness` (public landing) + `/app/readiness` (in-product) |

Every existing route stays addressable; new canonical lives at the new URL.

---

## 2. Navigation Structure

### 2.1 Public top nav (Navbar.jsx)

Layout (left → right):
```
[Logo] CertaintyAI™     Platform ▾   Solutions ▾   Architecture   Docs   Pricing      [Sign in]  [Start free →]
```

- **Platform ▾** — mega-menu mirroring the homepage chain:
  - Open Architecture · Ontology Fabric · Governance & Trust · Multi-Agent Orchestration · Domain Copilots · AI Control Tower · Business Outcomes
- **Solutions ▾** — by industry + "AI Readiness Assessment (free)" as a visible item.
- **Architecture** — direct link to the live SVG canvas (existing asset).
- **Docs** — open standards & dev docs.
- **Pricing** — three tiers (see §4).
- **CTA primary:** "Start free →" routes to `/signup` (defaults the user into Copilots, not the wizard).
- **CTA secondary:** "Sign in".
- **Tagline strip** (below logo on landing only): *Defensible AI for regulated industries · by MDxBlocks Inc.*

### 2.2 Authenticated console sidebar (Sidebar.jsx)

Sections, with collapse preserved (existing behavior):

```
Workspace
  • Home                  /app/home
  • Control Tower         /app/control-tower         ★ first-class
  • Copilots              /app/copilots              (Agent Builder renamed)
  • Ontology              /app/ontology              ★ NEW
  • Observability         /app/observability

Insights & Reports
  • AI Readiness          /app/readiness             (badge: "Optional")
  • Reports               /app/reports
  • Industry Benchmarks   /app/insights

System
  • Integrations          /app/integrations
  • Plugins               /app/plugins               (gated)
  • Settings              /app/settings
```

- **AI Readiness lives under "Insights & Reports"** with an explicit "Optional" pill. It is no longer the lock screen for unassessed users.
- **Control Tower and Copilots are promoted** to the top group — these are the primary daily-driver surfaces of the new positioning.
- **Ontology becomes a first-class console route** (new), reinforcing the architectural thesis the company is selling.
- The existing **"Built on Google Cloud · Powered by Vertex AI · Cloud Run · NIST AI RMF · ISO 42001 · EU AI Act"** trust block in the sidebar is **preserved verbatim**.

### 2.3 Onboarding model (post-signup)

Old: unassessed users locked into `?tab=readiness` until completion.
New: post-signup lands on `/app/home` which presents **four equal entry tiles**:

| Tile | Destination |
|---|---|
| **Explore the Architecture** | `/architecture` (live SVG canvas) |
| **Build a Copilot** | `/app/copilots/build` (CISO or CFO preset prompt) |
| **Open the Control Tower** | `/app/control-tower` |
| **Take the 2-min Readiness Check** | `/app/readiness` |

No tile is privileged. Readiness is encouraged via a friendly nudge ("Recommended for first-time CFO/CISO buyers") — never enforced.

---

## 3. Homepage Wireframe

Single-page scroll, anchor-linked to the seven nodes of the narrative chain. ASCII wireframe:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  NAVBAR    [Logo]  Platform ▾  Solutions ▾  Architecture  Docs  Pricing  [Sign in]  [Start free →]
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  HERO  (parchment theme by default; dark variant available)                  │
│                                                                              │
│   eyebrow:   OPEN ARCHITECTURE FOR GOVERNED AGENTIC AI                       │
│   h1:        Defensible AI for regulated industries.                         │
│   sub:       An open architecture — ontology, governance, orchestration,     │
│              copilots, and a control tower — that lets enterprises run       │
│              agentic AI they can actually defend in front of an auditor.     │
│                                                                              │
│   [ Explore the Architecture → ]   [ Start free ]   [ 2-min Readiness Check ]│
│                                                                              │
│   trust-strip: Built on Google Cloud · Vertex AI · NIST AI RMF · ISO 42001   │
│                · EU AI Act · Apache-2.0                                       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  NARRATIVE CHAIN (the 7 steps, vertical scroll OR horizontal scroller)       │
│                                                                              │
│   ① Open Architecture                                                        │
│      "One layered backbone. Open standards on every seam."                   │
│      ▸ A2A · MCP · W3C · OpenLineage · ISO 42001                              │
│      [ See the 6-layer stack → ]   ← anchors to ArchitectureStack canvas     │
│                                                                              │
│   ② Ontology Intelligence Fabric                                             │
│      "The trusted model of your business — what each thing means,            │
│       how it relates, and which rules govern it."                            │
│      ▸ W3C semantics · SNOMED/LOINC/ICD-10 · GraphRAG                         │
│      [ Read the spec → ]                                                     │
│                                                                              │
│   ③ Governance & Trust Layer                                                 │
│      "Policy, lineage, evidence packs. Every answer cites its sources."      │
│      ▸ Active Policy Engine · Evidence Pack · NIST GOVERN/MEASURE            │
│      [ See the trust contract → ]                                            │
│                                                                              │
│   ④ Multi-Agent Orchestration                                                │
│      "Agents reason, plan, and call tools — under your policies."            │
│      ▸ Google ADK SequentialAgent · A2A cross-process · MCP tools             │
│      [ Watch the live A2A handshake → ]                                      │
│                                                                              │
│   ⑤ Domain AI Copilots                                                       │
│      "Pre-built copilots for CISO and CFO. Build your own in minutes."       │
│      ▸ Knowledge base RAG · Voice · Step traces · Role templates              │
│      [ Build a Copilot → ]                                                   │
│                                                                              │
│   ⑥ AI Control Tower                                                         │
│      "One view of every agent, every decision, every cost."                  │
│      ▸ Run inventory · Policy violations · Spend · Confidence                 │
│      [ Tour the Control Tower → ]                                            │
│                                                                              │
│   ⑦ Business Outcomes                                                        │
│      "What this stack lets you actually do."                                 │
│      ▸ AI Readiness Assessment  ▸ Vendor Risk Triage  ▸ AI ROI Analyzer       │
│      ▸ Audit-ready reporting    ▸ Marketplace listing-ready                   │
│      [ See use cases → ]   [ 2-min Readiness Check → ]                       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  INTERACTIVE ARCHITECTURE CANVAS (embed of ArchitectureStack.jsx)             │
│   - Existing 3D isometric SVG, kept as-is                                    │
│   - Business / Technical toggle preserved                                    │
│   - On layer click, scrolls back up to the matching narrative card           │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  PROOF STRIP                                                                  │
│   • Live A2A across two processes (mini-terminal screencast loop)            │
│   • Deterministic scoring under a 52-passing test gate                       │
│   • Apache-2.0, no API keys committed                                        │
│   • Designed for Google Cloud Marketplace                                    │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  WHO IT'S FOR  (existing INDUSTRIES tiles, preserved styling)                 │
│   Healthcare · BFSI · Cybersecurity · Education · Government                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  THE HONESTY CONTRACT  (new section — productizes the audit's strength #3)    │
│   "Every number you see is computed. Where data isn't real, the UI says so." │
│   ▸ Deterministic scoring · ▸ Evidence Pack · ▸ Open-source license          │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  CTA BAND                                                                     │
│   [ Start free →  ]    [ Book a 20-min architecture review ]                  │
│   [ Take the 2-min Readiness Check ]                                          │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  FOOTER (existing Footer.jsx — preserved)                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

Design notes
- Parchment theme stays the default for marketing pages (preserves the established brand surface).
- Dark theme stays the default for the authenticated console (preserves existing dashboard chrome).
- Each narrative card is a hover-tilted glass plate, color-matched to the corresponding `ArchitectureStack.jsx` layer (Governance gold, Ontology teal, etc.) so the homepage and the canvas reinforce each other.
- The seven cards animate in on scroll, with a thin "C-shaped bezier" line connecting them (callback to the bridge line already used in the report).

---

## 4. CTA Strategy

Three CTAs, one per buyer mindset, ranked by position on every key page.

| Rank | CTA | Audience | Destination | Where it appears |
|---|---|---|---|---|
| **1. Primary** | **Explore the Architecture →** | Architect, CTO, evaluator | `/architecture` (live SVG) | Hero, every Platform sub-page, every Solutions sub-page, Docs index |
| **2. Activation** | **Start free →** | Builder, hands-on user | `/signup` → `/app/home` (four tiles) | Hero, sticky navbar, every Platform sub-page, end-of-page CTA band |
| **3. Lead-gen** | **2-min Readiness Check →** | CFO, CISO, board buyer | `/solutions/ai-readiness` → wizard | Hero (tertiary), Outcomes card #7, Solutions/AI Readiness, sidebar nudge |

Secondary CTAs by surface

- **Pricing page:** `Talk to sales` (enterprise tier) · `Start free` (Assess tier) · `Listing on Marketplace` (placeholder).
- **Docs:** `Open standards spec` · `Try in console`.
- **Solutions/Industry:** `See the X copilot` · `Read the case pattern`.
- **In-app `/app/home`:** four entry tiles (no privileged tile) — *Explore the Architecture · Build a Copilot · Open the Control Tower · Take the Readiness Check.*

CTA rules
1. **Readiness is never the only CTA** on any page above the fold. There must be at least one architecture CTA and one activation CTA visible first.
2. **No dead CTAs.** If a feature is roadmap, the CTA reads "Read the roadmap" and links to `/docs/<feature>` — never a clickable button into nothing.
3. **CTA copy is consistent** across the site. "Start free" never becomes "Get started" elsewhere — this is a brand discipline.
4. **A "Talk to architecture review" path** for enterprise — books a 20-min call, captures industry + estimated seats, routes to MDxBlocks sales.

---

## 5. Content Hierarchy

Four levels. Every page knows exactly which level it lives at.

### L1 — Positioning (one)
- **Open Architecture for Governed Agentic AI** — owns the homepage, `/platform`, and the global `<title>` template.

### L2 — Seven narrative pillars
Mirror the chain. Each pillar owns one Platform sub-page and contributes one card to the homepage.

1. Open Architecture (the umbrella; the layered canvas is the proof)
2. Ontology Intelligence Fabric
3. Governance & Trust Layer
4. Multi-Agent Orchestration
5. Domain AI Copilots
6. AI Control Tower
7. Business Outcomes

### L3 — Capability tiles (per pillar)
Each pillar page exposes 3–5 capability tiles. Each tile is one-paragraph + one visual + status (`Live`, `Beta`, `Roadmap`).

| Pillar | Capability tiles |
|---|---|
| Open Architecture | 6-Layer Stack · A2A v0.3.0 · MCP · OpenLineage · Apache-2.0 |
| Ontology Fabric | W3C Vocabulary · Healthcare Pack (SNOMED/LOINC/ICD-10) · BFSI Pack · GraphRAG · Versioning |
| Governance & Trust | Active Policy Engine · Evidence Pack · Audit Trail DB · Catalog Adapters (Purview/Collibra/Alation/Dataplex) · Honesty Contract |
| Orchestration | Google ADK SequentialAgent · Cross-process A2A · MCP tools · Provider-agnostic LLM client · Deterministic scoring firewall |
| Copilots | Role Templates (CISO/CFO) · Knowledge Base RAG · Voice · Step Traces · Tool Permissions |
| Control Tower | Run Inventory · Policy Violations · Spend & FinOps · Confidence · NIST sub-scores |
| Outcomes | AI Readiness Assessment · Vendor Risk Triage · AI ROI Analyzer · Audit-ready reporting · Marketplace listing |

### L4 — Reference docs
Each capability has a doc page under `/docs/<capability>`. Versioned. Linked from console "Help" affordances.

### Content rules
1. Every page declares its pillar in the breadcrumb.
2. Every roadmap claim carries an explicit `Roadmap` chip and links to `/docs/roadmap`.
3. **The AI Readiness Assessment is *one* L3 capability under Outcomes** — not a top-level concept. (This is the architectural shift, expressed in IA.)
4. The 6-Layer Stack canvas is the **single hero asset** reused across L1 (homepage), L2 (Open Architecture page), and L4 (Architecture docs).
5. Use the same vocabulary in marketing and console — when the homepage says "Copilots," the sidebar also says "Copilots."

---

## 6. Component-Level Recommendations

Reuse aggressively. New components are only introduced where existing ones don't map.

### 6.1 Reuse as-is (no semantic change)
- `components/LogoMark.jsx` — preserve.
- `components/Footer.jsx` — preserve.
- `components/ArchitectureStack.jsx` — preserve; **embed on homepage** in addition to `/architecture`.
- `components/AuthModal.jsx` — preserve.
- `components/ProtectedRoute.jsx` — preserve, retarget to `/app/*`.
- `components/ErrorBoundary.jsx` — preserve.
- `components/ReportPreview.jsx` / `ReportPreviewModal.jsx` — preserve.
- `components/survey/*` — preserve unchanged (`SurveyWizard`, `StepIndustry`, `StepMaturity`, `StepData`, `StepGovernance`, `StepReview`, `Primitives`).
- `pages/Report.jsx` — preserve.
- `pages/Architecture.jsx` — preserve.
- `pages/AgentBuilder.jsx` — preserve internals; rename surface to "Copilots"; mount at `/app/copilots`.

### 6.2 Repurpose (same component, new framing)
- `components/Hero.jsx` → becomes `components/OpenArchitectureHero.jsx`-shaped section. Same component, new copy + new dual+tertiary CTA layout. Tagline strip preserved.
- `components/AboutSection.jsx` → becomes the Honesty Contract section on the homepage.
- `components/ArchitectureSection.jsx` → becomes the "see the stack" anchor on the homepage that scroll-links into the embedded `ArchitectureStack`.
- `components/OntologySection.jsx` + `components/OntologyGraph.jsx` → move higher on the homepage to anchor the Ontology pillar card.
- `components/Navbar.jsx` → new public mega-menu (Platform/Solutions). Auth state still drives sign-in vs account chip. Region toggle preserved.
- `components/Sidebar.jsx` → new section grouping (Workspace · Insights & Reports · System); rename `Agent Builder` → `Copilots`; add `Ontology`; demote Readiness with `Optional` pill; preserve collapse, preserve trust block, preserve user card.
- `pages/Landing.jsx` → rewritten around the 7-step narrative; preserves `WHY_CARDS` / `INDUSTRIES` tile patterns under new section names.

### 6.3 New components (small, focused)
- `components/NarrativeChain.jsx` — the 7-card storyboard. Renders the seven nodes with a connecting bezier line. Each card takes `{ index, title, blurb, caps[], ctaLabel, ctaHref, accentColor }`.
- `components/NarrativeNode.jsx` — single card in the chain. Color-keyed to the matching `ArchitectureStack` layer.
- `components/PillarPage.jsx` — shared template for the 7 `/platform/*` sub-pages (breadcrumb + hero + capability tiles + related docs).
- `components/CapabilityTile.jsx` — L3 tile with `{ name, blurb, status: 'live'|'beta'|'roadmap', href, icon }`.
- `components/StatusChip.jsx` — `Live` / `Beta` / `Roadmap` pill. Used everywhere a claim is made.
- `components/CTABand.jsx` — three-CTA band reused at the end of every marketing page.
- `components/ProofStrip.jsx` — terminal screencast + Apache-2.0 + 52-passing badge + Marketplace badge.
- `components/SolutionPage.jsx` — shared template for `/solutions/*`.
- `components/HomeEntryTile.jsx` — the four-tile post-signup grid on `/app/home`.
- `pages/app/Home.jsx` — replaces `tab=home`.
- `pages/app/ControlTower.jsx` — first-class Control Tower (was a Dashboard tab).
- `pages/app/Ontology.jsx` — new ontology browser (NEW capability surface).
- `pages/app/Observability.jsx` — first-class observability (was Dashboard portfolio sub-tab).
- `pages/app/Integrations.jsx` — first-class integrations (was a Dashboard tab).
- `pages/app/Insights.jsx`, `pages/app/Plugins.jsx`, `pages/app/Settings.jsx` — extracted from Dashboard.
- `pages/app/Readiness.jsx` — thin wrapper around existing `SurveyWizard`.
- `pages/app/Reports.jsx` — extracted from Dashboard's reports tab.
- `pages/app/copilots/Library.jsx`, `pages/app/copilots/Build.jsx`, `pages/app/copilots/Runs.jsx` — split of `pages/AgentBuilder.jsx` into three sub-views.
- `pages/platform/*.jsx` (7 files) — pillar pages.
- `pages/solutions/*.jsx` (6 files) — industry + ai-readiness solution pages.
- `pages/Pricing.jsx`, `pages/Trust.jsx`, `pages/Company.jsx`, `pages/Docs.jsx` (+ children).

### 6.4 Decompose (mandatory before transformation)
- **`pages/Dashboard.jsx` (5,674 LOC)** — splits into the `pages/app/*` files above. The transformation cannot reasonably proceed without this; otherwise every new console route imports the monolith. This addresses audit recommendation R8.

### 6.5 Branding preservation rules (enforced in components)
- Logo mark, "CertaintyAI™" wordmark, parchment palette (`#F4F0E6` / `#FBF9F3` / `#FEFDFA` / `#14161A`), brass accents (`#A87C3C`), teal (`#1E3A36`), dark-theme tokens (`var(--dash-*)`) — **all preserved**.
- Tagline string *"Defensible AI for regulated industries"* — owned by one constant in `lib/branding.js` (NEW small file), referenced by Hero, Navbar tagline strip, Footer, and the SVG socials so it can't drift.
- "by MDxBlocks Inc." attribution — preserved.
- Sidebar trust block ("Built on Google Cloud · Powered by Vertex AI · Cloud Run · NIST AI RMF · ISO 42001 · EU AI Act") — preserved verbatim.

### 6.6 Console-side rules
- The `Sidebar` "Optional" pill on Readiness must read identically on `/app/home`'s Readiness entry tile.
- Existing tab query-string state (`useSearchParams().get('tab')`) is migrated to react-router routes so deep links continue to work via the redirects in §1.3.
- `AuthContext` keeps `first_assessment_completed`; the front-end no longer **enforces** the wizard, but the console still uses the flag to choose the *suggested* first action on `/app/home`.

---

## 7. Files Likely To Change

Grouped by likelihood and risk. **No edits yet** — this is the change-impact map for planning.

### 7.1 High-impact frontend (routing & shell)
| File | Change | Risk |
|---|---|---|
| `frontend/src/App.jsx` | Add `/platform/*`, `/solutions/*`, `/docs/*`, `/pricing`, `/trust`, `/company`, `/app/*` routes; add redirect routes from old `/dashboard?tab=*` to new `/app/*`. | Medium — tested via redirect coverage. |
| `frontend/src/pages/Landing.jsx` | Rewrite around the 7-step narrative; preserve INDUSTRIES tiles and WHY_CARDS structure with new copy. | High — most visible page. |
| `frontend/src/components/Navbar.jsx` | Replace flat links with Platform/Solutions mega-menus; preserve auth state + region toggle + theme switch. | Medium. |
| `frontend/src/components/Sidebar.jsx` | New three-group structure; rename "Agent Builder" → "Copilots"; add Ontology; add "Optional" pill on Readiness; preserve trust block, user card, collapse behavior. | Medium. |
| `frontend/src/pages/Dashboard.jsx` | **Decompose** into `pages/app/*` files; replace top-level `Dashboard.jsx` with a thin shell that owns the layout chrome only. | **High — refactor scope. This unblocks the rest.** |

### 7.2 New frontend files (additions only)
- `frontend/src/components/{NarrativeChain,NarrativeNode,PillarPage,CapabilityTile,StatusChip,CTABand,ProofStrip,SolutionPage,HomeEntryTile}.jsx`
- `frontend/src/pages/platform/{OpenArchitecture,Ontology,Governance,Orchestration,Copilots,ControlTower,Outcomes}.jsx`
- `frontend/src/pages/solutions/{Healthcare,BFSI,Cybersecurity,Education,Government,AIReadiness}.jsx`
- `frontend/src/pages/{Pricing,Trust,Company,Docs}.jsx` (+ doc children)
- `frontend/src/pages/app/{Home,ControlTower,Ontology,Observability,Integrations,Insights,Plugins,Settings,Readiness,Reports}.jsx`
- `frontend/src/pages/app/copilots/{Library,Build,Runs}.jsx`
- `frontend/src/lib/branding.js` (single source of tagline + brand strings)

### 7.3 Lower-impact frontend (rename or repurpose)
| File | Change |
|---|---|
| `frontend/src/components/Hero.jsx` | Repurpose copy for the new hero; keep DOM structure. |
| `frontend/src/components/AboutSection.jsx` | Repurpose as the Honesty Contract section. |
| `frontend/src/components/ArchitectureSection.jsx` | Anchor target for the embedded canvas. |
| `frontend/src/components/OntologySection.jsx` | Promoted onto homepage. |
| `frontend/src/components/ArchitectureStack.jsx` | No structural change; mounted in two places. |
| `frontend/src/pages/AgentBuilder.jsx` | Rename UI string "Agent Builder" → "Copilots" (the page itself can stay where it is, but the canonical route becomes `/app/copilots`). |
| `frontend/src/pages/Survey.jsx` | Stays; reachable from `/solutions/ai-readiness` and `/app/readiness`. |
| `frontend/src/pages/Foundry.jsx` | Reframe as a Solutions sub-page (Industry Foundry) rather than a separate top-level. |
| `frontend/src/pages/Login.jsx`, `Signup.jsx`, `Profile.jsx` | Preserve. |
| `frontend/src/components/ProtectedRoute.jsx` | Retarget redirect from `/login` to preserve `next=`; remove the lock-into-wizard behavior. |
| `frontend/src/context/AuthContext.jsx` | Keep `first_assessment_completed`; use it for *suggestion* logic on `/app/home` only. |

### 7.4 Backend (zero forced changes; optional ergonomic ones)

The transformation is primarily a front-end repositioning and information-architecture change. The backend continues to serve `/survey`, `/survey/adk`, `/agents/*`, `/auth/*`, `/report/*`, `/a2a/*` unchanged.

Optional follow-ons (not required for repositioning):
| File | Optional change | Why |
|---|---|---|
| `backend/app/routers/auth.py` | Stop hard-routing post-signup based on `first_assessment_completed` (already client-side, but worth a comment update). | Honest IA. |
| `backend/app/main.py` | Add CORS entries for any new public host (none anticipated). | Hygiene. |
| `backend/app/mcp_server.py` | **Wire at startup** (R7 from audit) — strongly recommended in the same sprint because the new positioning leans hard on "open architecture / MCP." | Closes a credibility gap exposed by the new positioning. |

### 7.5 Docs, brand, and submission
| File | Change |
|---|---|
| `README.md` | Replace lede with new positioning; preserve quickstart and demo logins; clarify Readiness is one of several entry points. |
| `SUBMISSION.md` (root) | Reconcile with `Context/SUBMISSION.md`; align both to ADK + Vertex + A2A primary; restate Readiness as the flagship use case under the Open Architecture umbrella. |
| `Context/SUBMISSION.md` | Update tagline header to *"Open Architecture for Governed Agentic AI — Defensible AI for regulated industries."* |
| `Docs/PROJECT_AUDIT.md` | Unchanged (this transformation plan is the response to it). |
| `Docs/CERTAINTYAI_TRANSFORMATION_PLAN.md` | This document. |
| `Docs/architecture.png` | Optional regenerate to surface the 7-step chain as a banded view alongside the existing 10-layer stack. |

### 7.6 Files that should NOT change
- `backend/app/agents/score_agent.py` — **scoring firewall**, do not touch.
- `backend/tests/test_score_agent.py` — locked.
- `backend/app/agents/llm_client.py` — provider abstraction stays as-is.
- `backend/app/report/template.html` — only the post-submission honesty-scrub round 2 items are touched (per audit R1), independently of this transformation.
- All `frontend/src/components/survey/*` — wizard internals stay byte-stable.

---

## 8. Sequenced Execution Plan (advisory)

A reasonable order of operations. Not committing to dates here — the user asked for planning only.

1. **Pre-work (zero risk):** Add `lib/branding.js`; introduce `StatusChip`, `CapabilityTile`, `NarrativeNode`, `NarrativeChain`, `CTABand` components in isolation; cover with one Storybook-style smoke page.
2. **Refactor (`Dashboard.jsx` decomposition):** Split into `pages/app/*` behind the existing `/dashboard?tab=*` routes first. Keep query-string routing live. Verifies no behavior regression before any URL change.
3. **Console routes:** Introduce `/app/*` routes mounted on the same per-tab files. Add redirects from old `/dashboard?tab=*` paths. Both paths work in parallel.
4. **Sidebar restructure:** Apply new grouping + "Copilots" rename + "Ontology" addition + Readiness "Optional" pill. Keep collapse + trust block + user card intact.
5. **Marketing site IA:** Add `/platform/*`, `/solutions/*`, `/pricing`, `/trust`, `/company`, `/docs/*` as scaffolds with `PillarPage` and `SolutionPage` templates. Empty bodies are acceptable behind `Roadmap` chips.
6. **Homepage rewrite:** Replace `Landing.jsx` body with `NarrativeChain` + embedded `ArchitectureStack` + new hero + Honesty Contract section + CTA band. Preserve INDUSTRIES tiles.
7. **Navbar mega-menu + new CTA hierarchy:** Activate Platform/Solutions menus and the three-CTA model.
8. **Onboarding model:** Switch post-signup landing from "wizard lock" to `/app/home` four-tile grid.
9. **Docs filling:** Begin populating `/docs/<capability>` with one-paragraph specs + status chips; `Roadmap` is honest until a feature is real.
10. **Doc reconciliation:** Update `README.md` and both `SUBMISSION.md` files to the new positioning.
11. **Backend optional pickups:** Wire MCP at startup; clear the comment in `auth.py` about the readiness lock; leave scoring + ADK + A2A code untouched.

### Definition of done for the transformation
- A first-time anonymous visitor on `/` reads "Open Architecture for Governed Agentic AI" above the fold and can take any of three CTAs without seeing the wizard first.
- A signed-up user lands on `/app/home` and sees four equal entry tiles; the wizard is one option, not the gate.
- `Architecture`, `Copilots`, `Control Tower`, `Ontology`, and `Readiness` are all first-class routes in the console and first-class navigation in the marketing site.
- Every roadmap claim carries a visible `Roadmap` chip; every Live claim is in fact live.
- No regression in the AI Readiness flow, no regression in Agent Builder, no regression in Control Tower's existing surface, no change in scoring math.
- The tagline *"Defensible AI for regulated industries"* appears in exactly one constant file and is rendered consistently in hero, navbar, footer, and OG metadata.

---

*End of transformation plan. No source files modified. Companion: `Docs/PROJECT_AUDIT.md`.*
