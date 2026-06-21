import { Check, Copy } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Container, Section } from '@/components/layout'
import {
  CTASection,
  FAQSection,
  HeroSection,
  StickyCTA,
} from '@/components/sections'
import { Badge } from '@/components/ui/badge'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'
import { openGitHubRepo } from '@/utils/github'
import { trackCTAClick, trackEvent } from '@/utils/gtm'
import { getPageSEO } from '@/utils/seo'

import './Blueprints.illustrations.css'

// Campaign slug shared by every CTA on this page (UTM params + `cta_click`
// event), per the issue's analytics requirement. CTA surfaces are distinguished
// by `location` (blueprints_hero / blueprints_final / blueprints_sticky),
// mirroring the site-wide "utm_medium = surface" convention and Prompts.tsx.
const CAMPAIGN = 'blueprints'

// The AI tools Blueprints configures, shown as a "works with" strip under the
// hero. Inline monochrome currentColor SVGs (matching the prototype) resolve to
// the foreground ink on the light strip — on-brand and crisp at any size.
const TOOLS: { name: string; icon: ReactNode }[] = [
  {
    name: 'Claude Code',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" />
      </svg>
    ),
  },
  {
    name: 'Cursor',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      >
        <path d="m21 8-9-5-9 5v8l9 5 9-5Z" />
        <path d="m3 8 9 5 9-5M12 13v8" />
      </svg>
    ),
  },
  {
    name: 'Codex',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m7 8-4 4 4 4M13 16h4" />
      </svg>
    ),
  },
  {
    name: 'Claude',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.5" />
      </svg>
    ),
  },
  {
    name: 'VS Code',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
      </svg>
    ),
  },
  {
    name: 'Gemini CLI',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      >
        <path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2Z" />
      </svg>
    ),
  },
  {
    name: 'MCP',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" />
      </svg>
    ),
  },
]

// The three problem cards: where scattered rules files go wrong today (§5.3).
const PROBLEM_CARDS: { icon: ReactNode; title: string; body: ReactNode }[] = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v3" />
        <path d="M5.6 5.6l2.1 2.1" />
        <path d="M18.4 5.6l-2.1 2.1" />
        <path d="M3 12h3" />
        <path d="M18 12h3" />
        <path d="M12 18v3" />
        <path d="M7.7 16.3l-2.1 2.1" />
        <path d="M16.3 16.3l2.1 2.1" />
      </svg>
    ),
    title: 'Rules are scattered',
    body: (
      <>
        <code className="bp-code">CLAUDE.md</code> in one repo,{' '}
        <code className="bp-code">.cursorrules</code> in another,{' '}
        <code className="bp-code">AGENTS.md</code> somewhere else. No single
        source of truth for how your AI should behave.
      </>
    ),
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 3v5" />
        <path d="M7 8a4 4 0 0 0 4 4h2a4 4 0 0 1 4 4v4" />
        <path d="M17 3v5" />
      </svg>
    ),
    title: 'They drift out of sync',
    body: 'You fix a convention in one place and forget the other four. Each tool slowly behaves a little differently — and nobody notices until it bites.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    title: 'You re-explain them every session',
    body: 'New chat, new tool, new teammate — you restate the same standards from scratch, again. Your stack, your conventions, every time.',
  },
]

interface Bullet {
  title: string
  description: string
}

const IMPORT_BULLETS: Bullet[] = [
  {
    title: 'Auto-classified.',
    description:
      'Each file is typed by tool and kind — rules, sub-agent, skill, slash-command — with front-matter parsed for titles and descriptions.',
  },
  {
    title: 'Idempotent & reported.',
    description:
      'A clear import report — scanned, imported, skipped, failed — and re-imports skip what’s already there.',
  },
]

const ORGANIZE_BULLETS: Bullet[] = [
  {
    title: 'Typed, not tangled.',
    description:
      'A tool badge on every blueprint — usable as a list filter across your whole library.',
  },
  {
    title: 'Grouped by project.',
    description:
      'Every blueprint belongs to a project, with search, type filter, and sort to keep big libraries tidy.',
  },
]

const VERSION_BULLETS: Bullet[] = [
  {
    title: 'Treat rules like code.',
    description:
      'Author attribution and timestamps on every snapshot, with a searchable timeline.',
  },
  {
    title: 'Diff & non-destructive restore.',
    description:
      'Compare split or unified; restoring is itself a new version, so nothing is lost.',
  },
]

// The three MCP setup steps (verbatim from the approved design copy, §5.8).
const MCP_STEPS: { title: string; description: string }[] = [
  {
    title: 'Copy the endpoint.',
    description: 'The same one works for every AI tool you connect.',
  },
  {
    title: 'Add it to your AI tool.',
    description: 'Paste it into Claude Code, Cursor, or Codex.',
  },
  {
    title: 'Sign in and pick a workspace.',
    description:
      'Authorize in the browser — your AI now retrieves the right rules on demand.',
  },
]

// FAQ answers are plain strings rendered by the shared shadcn accordion
// (FAQSection) — the canonical site FAQ pattern. Copy verbatim from §5.12, with
// the merged "free / API key" item split into two (§8 review fix).
const FAQS: { q: string; a: string }[] = [
  {
    q: 'What’s a blueprint — and how is it different from a prompt?',
    a: 'A blueprint is a stored, versioned Markdown document that captures the rules, guidelines, and config that govern an AI tool’s behavior — coding standards, instruction files like CLAUDE.md and AGENTS.md, and tool config such as sub-agents, skills, and slash-commands. Prompts are what you ask (the task); blueprints are the rules it always follows.',
  },
  {
    q: 'Which tools does it work with?',
    a: 'Every blueprint is typed for the tool it configures: General, Claude Code, Claude, Cursor, or Codex. Your AI retrieves the right rules over MCP in those tools, and you can reach them from the CLI and API too.',
  },
  {
    q: 'Can I import my existing CLAUDE.md / .cursorrules / AGENTS.md?',
    a: 'Yes — in one click. Connect the GitHub App and VibeXP scans a fixed set of locations (.claude/, .cursor/, .codex/, .agents/, plus root CLAUDE.md, AGENTS.md, CURSOR.md), imports the Markdown files, auto-classifies each by tool and kind, and gives you an import report. Re-imports are idempotent — existing blueprints are skipped.',
  },
  {
    q: 'Can I track and roll back changes?',
    a: 'Yes. Every change is snapshotted with author and timestamp. Search the timeline, diff any two versions side by side (split or unified), and restore an earlier version non-destructively — restoring is itself a new version, so newer history is never lost.',
  },
  {
    q: 'How does my AI actually use these rules?',
    a: 'Your AI pulls the right rules from your library through the team’s MCP server using semantic retrieval — one OAuth endpoint that works for every connected tool. The CLI and API reach them too, and you can copy any blueprint to paste anywhere. VibeXP doesn’t write files back to your repo — import is one-directional, GitHub → VibeXP.',
  },
  {
    q: 'Can my team share rules?',
    a: 'Yes. Blueprints live in a shared team workspace where every member finds, uses, and improves the same rules, with every change attributed to its author. New teammates inherit your conventions on day one instead of guessing.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. VibeXP is free and open source — self-host it, with MCP access included, and keep as many blueprints as you need.',
  },
  {
    q: 'Do I need an API key?',
    a: 'No. MCP integration is OAuth-only, so you sign in through the browser with nothing to copy, paste, and babysit.',
  },
]

/** Pill eyebrow with a leading dot, matching the approved design. */
function PillEyebrow({ children }: { children: ReactNode }) {
  return (
    <Badge variant="secondary">
      <span
        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-50"
        aria-hidden="true"
      />
      {children}
    </Badge>
  )
}

/** Uppercase overline eyebrow with a leading dot, for the feature bands. */
function OverlineEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="type-overline flex items-center gap-2 text-muted-foreground">
      <span
        className="h-1.5 w-1.5 rounded-full bg-foreground"
        aria-hidden="true"
      />
      {children}
    </p>
  )
}

/** A title + description list item rendered with a small check badge. */
function BulletList({ bullets }: { bullets: Bullet[] }) {
  return (
    <ul className="mt-6 space-y-4">
      {bullets.map(bullet => (
        <li key={bullet.title} className="flex gap-3">
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-foreground text-background"
            aria-hidden="true"
          >
            <Check className="h-3 w-3" />
          </span>
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              {bullet.title}
            </span>{' '}
            {bullet.description}
          </span>
        </li>
      ))}
    </ul>
  )
}

interface FeatureBandProps {
  id?: string
  eyebrow: ReactNode
  heading: string
  body: ReactNode
  bullets?: Bullet[]
  media: ReactNode
  /** Render the media on the left at `lg` (copy on the right). */
  reverse?: boolean
  /** Use the muted background instead of the default page background. */
  muted?: boolean
  testId?: string
}

/**
 * FeatureBand is the shared two-column "copy + illustration" band used by the
 * GitHub-import, organized-per-tool, and version-history sections — mirroring
 * the FeatureBand introduced by the Prompts page (#1901). The illustration side
 * alternates left/right via `reverse`, and the background alternates via `muted`.
 */
function FeatureBand({
  id,
  eyebrow,
  heading,
  body,
  bullets,
  media,
  reverse = false,
  muted = false,
  testId,
}: FeatureBandProps) {
  return (
    <Section
      id={id}
      className={muted ? 'bg-muted' : 'bg-background'}
      data-testid={testId}
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className={cn('min-w-0', reverse && 'lg:order-2')}>
            {eyebrow}
            <h2 className="type-section mt-4">{heading}</h2>
            <p className={cn('mt-4', 'type-lead')}>{body}</p>
            {bullets && <BulletList bullets={bullets} />}
          </div>
          <div className={cn('w-full min-w-0', reverse && 'lg:order-1')}>
            {media}
          </div>
        </div>
      </Container>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Illustrations (8) — ported verbatim from the approved #1900 prototype
   (exact geometry/markup), styled by Blueprints.illustrations.css under the
   .px-art scope. Monochrome, design-system tokens, light-only, aria-hidden. */
/* ------------------------------------------------------------------ */

/** Reusable inline SVG icons used inside several illustrations. */
const IconFile = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
)
const IconFolder = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
  </svg>
)
const IconBook = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const IconClaudeCode = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" />
  </svg>
)
const IconCursor = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinejoin="round"
  >
    <path d="m21 8-9-5-9 5v8l9 5 9-5Z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </svg>
)
const IconCodex = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m7 8-4 4 4 4M13 16h4" />
  </svg>
)
const IconClaude = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
)
const IconCheck = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const IconUser = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
)
const IconWordmark = (
  <svg viewBox="0 0 512 512" fill="none">
    <path
      d="M128 256h48l32-96 64 192 32-96h48"
      stroke="currentColor"
      strokeWidth="40"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)
const IconSearch = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

/** #1 — Hero: scattered config files → one ordered Blueprints library. */
function HeroBlueprintGraph() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="compose">
        <svg
          className="compose-lines"
          viewBox="0 0 482 472"
          preserveAspectRatio="xMidYMid meet"
        >
          <g fill="none" strokeLinecap="round">
            <path className="flow" d="M120 64 C 220 64, 230 200, 296 214" />
            <path className="flow" d="M96 150 C 210 150, 220 210, 296 220" />
            <path className="flow" d="M118 238 C 220 238, 235 232, 296 228" />
            <path className="flow" d="M100 330 C 215 330, 225 244, 296 234" />
            <path className="flow" d="M132 406 C 225 406, 235 256, 296 242" />
          </g>
        </svg>
        <span className="cn-zone" style={{ left: '6%', top: '3%' }}>
          repo A
        </span>
        <span className="cn-zone" style={{ left: '4%', top: '62%' }}>
          laptop
        </span>
        <div className="cn" style={{ left: '25%', top: '13.5%' }}>
          <span className="cn-chip">
            {IconFile}
            <span className="ref">CLAUDE.md</span>
          </span>
        </div>
        <div className="cn" style={{ left: '20%', top: '31.8%' }}>
          <span className="cn-chip">
            {IconFile}
            <span className="ref">.cursorrules</span>
          </span>
        </div>
        <div className="cn" style={{ left: '25%', top: '50.4%' }}>
          <span className="cn-chip">
            {IconFile}
            <span className="ref">AGENTS.md</span>
          </span>
        </div>
        <div className="cn" style={{ left: '21%', top: '69.9%' }}>
          <span className="cn-chip">
            {IconFolder}
            <span className="ref">.claude/</span>
          </span>
        </div>
        <div className="cn" style={{ left: '27.5%', top: '86%' }}>
          <span className="cn-chip">
            {IconFolder}
            <span className="ref">.cursor/</span>
          </span>
        </div>
        <div className="cn cn-lib" style={{ left: '74%', top: '48.3%' }}>
          <div className="lib-h">
            {IconBook}
            Blueprints
            <span className="ct">12</span>
          </div>
          <div className="lib-row">
            <span className="lr-f">CLAUDE.md</span>
            <span className="lr-b">Claude Code</span>
          </div>
          <div className="lib-row">
            <span className="lr-f">.cursorrules</span>
            <span className="lr-b">Cursor</span>
          </div>
          <div className="lib-row">
            <span className="lr-f">AGENTS.md</span>
            <span className="lr-b">Codex</span>
          </div>
          <div className="lib-row">
            <span className="lr-f">review-agent</span>
            <span className="lr-b">Claude</span>
          </div>
        </div>
        <div className="cn-cap">Scattered rules files → one ordered library</div>
      </div>
    </div>
  )
}

/** #2 — Solution: a Rules library node feeding the four AI tools. */
function SolutionHubIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="solu-hub">
        <svg
          className="compose-lines"
          viewBox="0 0 420 356"
          preserveAspectRatio="xMidYMid meet"
        >
          <g fill="none" strokeLinecap="round">
            <path className="flow" d="M140 178 C 230 178, 250 64, 318 64" />
            <path className="flow" d="M140 178 C 240 178, 260 134, 318 134" />
            <path className="flow" d="M140 178 C 240 178, 260 222, 318 222" />
            <path className="flow" d="M140 178 C 230 178, 250 292, 318 292" />
          </g>
        </svg>
        <div className="lib-core">
          <div className="lc-h">
            {IconBook}
            Rules library
          </div>
          <div className="lc-row a" />
          <div className="lc-row" />
          <div className="lc-row a" />
          <div className="lc-row" />
        </div>
        <div className="tool-node" style={{ left: '76%', top: '18%' }}>
          {IconClaudeCode}
          <small>Claude Code</small>
        </div>
        <div className="tool-node" style={{ left: '76%', top: '37.6%' }}>
          {IconCursor}
          <small>Cursor</small>
        </div>
        <div className="tool-node" style={{ left: '76%', top: '62.4%' }}>
          {IconCodex}
          <small>Codex</small>
        </div>
        <div className="tool-node" style={{ left: '76%', top: '82%' }}>
          {IconClaude}
          <small>Claude</small>
        </div>
      </div>
    </div>
  )
}

/** #3 — Prompts vs Blueprints clarifier (two-up cards). */
function ClarifierBlock() {
  return (
    <div className="px-art clarify-block">
      <p className="clarify-line">
        Prompts are what you ask.{' '}
        <em>Blueprints are the rules it always follows.</em>
      </p>
      <div className="clarify">
        <div className="cc">
          <div className="ch">
            <span className="ci" aria-hidden="true">
              {IconCodex}
            </span>
            <span className="ck">
              Prompts
              <small>What you ask</small>
            </span>
          </div>
          <p>
            The task you hand the AI — reusable, composable instructions you
            invoke per job.{' '}
            <Link to="/features/prompts" className="cc-link">
              Explore Prompts →
            </Link>
          </p>
        </div>
        <div className="cc is-bp">
          <div className="ch">
            <span className="ci" aria-hidden="true">
              {IconBook}
            </span>
            <span className="ck">
              Blueprints
              <small>The rules it always follows</small>
            </span>
          </div>
          <p>
            The standing standards and config the AI obeys on every task — your
            coding conventions, instruction files, and tool config, organized
            per tool.
          </p>
        </div>
      </div>
    </div>
  )
}

/** #4 — GitHub import scanning panel + report (the lead illustration). */
function GithubImportIllustration() {
  const rows: {
    fn: string
    tool: string
    kind: string
    skip?: boolean
  }[] = [
    { fn: 'CLAUDE.md', tool: 'Claude Code', kind: 'CLAUDE.md' },
    { fn: 'AGENTS.md', tool: 'Codex', kind: 'AGENTS.md' },
    { fn: '.cursorrules', tool: 'Cursor', kind: 'rules' },
    { fn: '.claude/agents/reviewer.md', tool: 'Claude Code', kind: 'sub-agent' },
    {
      fn: '.codex/commands/ship.md',
      tool: 'Codex',
      kind: 'slash-command',
      skip: true,
    },
  ]
  return (
    <div className="px-art" aria-hidden="true">
      <div className="dia">
        <div className="gh">
          <div className="gh-src">
            <span className="ghi">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49l-.01-1.9c-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9l-.01 2.81c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
              </svg>
            </span>
            <span className="repo">your-org/payments-api</span>
            <span className="scan">
              <span className="d" />
              Scanning
            </span>
          </div>
          <div className="gh-rows">
            {rows.map(row => (
              <div className="imp" key={row.fn}>
                <span className={cn('ok', row.skip && 'skip')}>
                  {row.skip ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  ) : (
                    IconCheck
                  )}
                </span>
                <span className="fn">{row.fn}</span>
                <span className="tbadge">{row.tool}</span>
                <span className="kbadge">{row.kind}</span>
              </div>
            ))}
          </div>
          <div className="gh-report">
            <div className="rp">
              <b>12</b>
              <span>Scanned</span>
            </div>
            <div className="rp">
              <b>9</b>
              <span>Imported</span>
            </div>
            <div className="rp">
              <b>3</b>
              <span>Skipped</span>
            </div>
            <div className="rp">
              <b>0</b>
              <span>Failed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** #5 — Organized per tool: typed columns per tool. */
function ToolColumnsIllustration() {
  const cols: {
    icon: ReactNode
    name: string
    count: string
    items: { bn: string; bk: string }[]
  }[] = [
    {
      icon: IconClaudeCode,
      name: 'Claude Code',
      count: '4',
      items: [
        { bn: 'CLAUDE.md', bk: 'Instruction file' },
        { bn: 'reviewer', bk: 'Sub-agent' },
      ],
    },
    {
      icon: IconCursor,
      name: 'Cursor',
      count: '3',
      items: [
        { bn: '.cursorrules', bk: 'Rules' },
        { bn: 'ui-conventions', bk: 'Rules' },
      ],
    },
    {
      icon: IconCodex,
      name: 'Codex',
      count: '5',
      items: [
        { bn: 'AGENTS.md', bk: 'Instruction file' },
        { bn: 'ship', bk: 'Slash-command' },
      ],
    },
  ]
  return (
    <div className="px-art" aria-hidden="true">
      <div className="dia">
        <div className="toolcols">
          {cols.map(col => (
            <div className="tcol" key={col.name}>
              <div className="tcol-h">
                <span className="ti">{col.icon}</span>
                {col.name}
                <span className="ct">{col.count}</span>
              </div>
              {col.items.map(item => (
                <div className="bp" key={item.bn}>
                  <span className="bn">{item.bn}</span>
                  <span className="bk">{item.bk}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** #6 — Version history: timeline + unified diff. */
function VersionHistoryIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="dia">
        <div className="vh-grid">
          <ul className="timeline">
            <li className="cur">
              <span className="dot" />
              <div className="vrow">
                <span className="vtag">v6</span>
                <span className="pill">Current</span>
              </div>
              <div className="meta">
                <b>You</b> · 3s ago
              </div>
              <span className="restore">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                </svg>
                Viewing
              </span>
            </li>
            <li>
              <span className="dot" />
              <div className="vrow">
                <span className="vtag">v5</span>
                <span className="pill ghost">Edited</span>
              </div>
              <div className="meta">
                <b>M. Rahman</b> · 2d ago
              </div>
              <span className="restore">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Restore
              </span>
            </li>
            <li>
              <span className="dot" />
              <div className="vrow">
                <span className="vtag">v4</span>
              </div>
              <div className="meta">
                <b>You</b> · 5d ago
              </div>
            </li>
          </ul>
          <div className="diff">
            <div className="dh">
              <span>CLAUDE.md · v5 → v6</span>
              <span className="seg">
                <span>Split</span>
                <span className="on">Unified</span>
              </span>
            </div>
            <div className="dbody">
              <div className="dl">
                <span className="gut">{' '}</span>
                <span>## Go conventions</span>
              </div>
              <div className="dl del">
                <span className="gut">-</span>
                <span>Handle errors however you like.</span>
              </div>
              <div className="dl add">
                <span className="gut">+</span>
                <span>Wrap errors with %w and add context.</span>
              </div>
              <div className="dl add">
                <span className="gut">+</span>
                <span>Prefer table-driven tests.</span>
              </div>
              <div className="dl">
                <span className="gut">{' '}</span>
                <span>Run gofmt before every commit.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** #7 — Dark MCP band: radial hub fanning the Rules core out to every tool. */
function McpHubIllustration() {
  return (
    <div className="mcp-hub" aria-hidden="true">
      <svg
        className="mcp-hub-lines"
        viewBox="0 0 380 380"
        preserveAspectRatio="xMidYMid meet"
      >
        <g fill="none" strokeLinecap="round">
          <path className="flow" d="M190 190 L190 64" />
          <path className="flow" d="M190 190 L300 127" />
          <path className="flow" d="M190 190 L300 253" />
          <path className="flow" d="M190 190 L190 316" />
          <path className="flow" d="M190 190 L80 253" />
          <path className="flow" d="M190 190 L80 127" />
        </g>
      </svg>
      <div className="mcp-core">
        {IconBook}
        <span>Rules</span>
      </div>
      <div className="mcp-node" style={{ left: '50%', top: '16%' }}>
        {IconClaudeCode}
        <small>Claude Code</small>
      </div>
      <div className="mcp-node" style={{ left: '79%', top: '33%' }}>
        {IconCursor}
        <small>Cursor</small>
      </div>
      <div className="mcp-node" style={{ left: '79%', top: '67%' }}>
        {IconCodex}
        <small>Codex</small>
      </div>
      <div className="mcp-node" style={{ left: '50%', top: '84%' }}>
        {IconClaude}
        <small>Claude</small>
      </div>
      <div className="mcp-node" style={{ left: '21%', top: '67%' }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m7 8-4 4 4 4M13 16h4" />
        </svg>
        <small>CLI</small>
      </div>
      <div className="mcp-node" style={{ left: '21%', top: '33%' }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
          <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
        </svg>
        <small>API</small>
      </div>
    </div>
  )
}

/** #8a — Semantic search results panel. */
function SemanticSearchIllustration() {
  const results: {
    icon: ReactNode
    nm: string
    tool: string
    sd: string
    score: string
    best?: boolean
  }[] = [
    {
      icon: IconBook,
      nm: 'CLAUDE.md',
      tool: 'Claude Code',
      sd: '“Wrap errors with %w and add context…”',
      score: '0.94',
      best: true,
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 9V5a3 3 0 0 0-6 0v4" />
          <rect width="18" height="11" x="3" y="9" rx="2" />
        </svg>
      ),
      nm: 'backend-standards',
      tool: 'General',
      sd: '“Errors are values — never panic in handlers…”',
      score: '0.81',
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 18 22 12 16 6" />
          <path d="M8 6 2 12 8 18" />
        </svg>
      ),
      nm: 'reviewer',
      tool: 'Claude Code',
      sd: '“Flag unwrapped errors during review…”',
      score: '0.76',
    },
  ]
  return (
    <div className="dia" aria-hidden="true">
      <div className="dia-h">
        {IconSearch}
        Semantic search
        <span className="sub">by meaning, not keywords</span>
      </div>
      <div className="srch-bar">
        {IconSearch}
        <span className="q">
          how should the AI <em>handle errors in Go?</em>
        </span>
      </div>
      <div className="sresult">
        {results.map(r => (
          <div className={cn('srow', r.best && 'best')} key={r.nm}>
            <span className="si">{r.icon}</span>
            <div className="sb">
              <div className="st">
                <span className="nm">{r.nm}</span>
                <span className="tbadge">{r.tool}</span>
              </div>
              <div className="sd">{r.sd}</div>
            </div>
            <span className="score">{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** #8b — Usage-by-blueprint stacked-bar chart with Web/CLI/MCP/API legend. */
function UsageChartIllustration() {
  const bars: {
    bv: string
    h: string
    segs: [string, string, string, string]
    bl: string
  }[] = [
    { bv: '128', h: '90%', segs: ['24%', '22%', '44%', '10%'], bl: 'CLAUDE.md' },
    { bv: '96', h: '68%', segs: ['18%', '30%', '40%', '12%'], bl: '.cursorrules' },
    { bv: '71', h: '52%', segs: ['22%', '20%', '46%', '12%'], bl: 'AGENTS.md' },
    { bv: '44', h: '34%', segs: ['14%', '18%', '52%', '16%'], bl: 'reviewer' },
    { bv: '23', h: '20%', segs: ['30%', '26%', '30%', '14%'], bl: 'ship' },
  ]
  return (
    <div className="dia" aria-hidden="true">
      <div className="dia-h">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <rect width="4" height="7" x="7" y="10" />
          <rect width="4" height="11" x="15" y="6" />
        </svg>
        Usage by blueprint
        <span className="sub">last 30 days</span>
      </div>
      <div className="usage">
        <div className="chart">
          {bars.map(bar => (
            <div className="bar-col" key={bar.bl}>
              <span className="bv">{bar.bv}</span>
              <div className="bar" style={{ height: bar.h }}>
                <div className="seg s1" style={{ height: bar.segs[0] }} />
                <div className="seg s2" style={{ height: bar.segs[1] }} />
                <div className="seg s3" style={{ height: bar.segs[2] }} />
                <div className="seg s4" style={{ height: bar.segs[3] }} />
              </div>
              <span className="bl">{bar.bl}</span>
            </div>
          ))}
        </div>
        <div className="legend">
          <span className="lg">
            <span className="sw s1" />
            Web
          </span>
          <span className="lg">
            <span className="sw s2" />
            CLI
          </span>
          <span className="lg">
            <span className="sw s3" />
            MCP
          </span>
          <span className="lg">
            <span className="sw s4" />
            API
          </span>
        </div>
      </div>
    </div>
  )
}

/** Solo → Team mesh illustration. */
function SoloTeamIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="team-vis">
        <div className="cluster">
          <div className="node-core">{IconWordmark}</div>
          <span className="cluster-label">Solo</span>
        </div>
        <span className="arrow-between">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
        <div className="cluster">
          <div className="team-mesh">
            <div className="node-sm">{IconUser}</div>
            <div className="node-sm">{IconUser}</div>
            <div className="node-sm">{IconUser}</div>
            <div className="node-sm">{IconUser}</div>
            <div className="node-core">{IconWordmark}</div>
            <div className="node-sm">{IconUser}</div>
            <div className="node-sm">{IconUser}</div>
            <div className="node-sm">{IconUser}</div>
            <div className="node-sm">{IconUser}</div>
          </div>
          <span className="cluster-label">Team</span>
        </div>
      </div>
    </div>
  )
}

/** Copyable MCP endpoint with an accessible copied state (dark band). */
function CopyEndpoint() {
  const [copied, setCopied] = useState(false)
  const endpoint = 'https://connect.vibexp.io/mcp/v1/common'

  const handleCopy = () => {
    void navigator.clipboard?.writeText(endpoint)
    trackEvent('copy_mcp_endpoint', { location: 'blueprints_mcp' })
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="endpoint">
      <span className="ep-label">MCP</span>
      <code>{endpoint}</code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy MCP endpoint ${endpoint}`}
        className={cn('copy-btn', copied && 'copied')}
      >
        <Copy aria-hidden="true" />
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

/** Lead-feature eyebrow: a primary pill + overline label (§5.5). */
function LeadFeatureEyebrow() {
  return (
    <p className="type-overline flex items-center gap-2 text-muted-foreground">
      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] tracking-wide text-primary-foreground">
        Lead feature
      </span>
      One-click GitHub import
    </p>
  )
}

export function Blueprints() {
  const navigate = useNavigate()

  // SEO. Page-view tracking is handled once at the App level via
  // usePageTracking(); calling it here would double-count page_view.
  useSEO(getPageSEO('blueprints'))

  // Opens the public GitHub repo with surface-scoped UTM params and fires the
  // `cta_click` event. `location` distinguishes which CTA was used
  // (hero / final / sticky).
  const handleViewOnGitHub = (location: string) => {
    trackCTAClick(location, CAMPAIGN, 'github_repo')
    openGitHubRepo(location)
  }

  // Secondary "See how it works" CTA → the dedicated marketing page.
  const handleSeeHowItWorks = (location: string) => {
    trackEvent('navigation_click', {
      location,
      destination: 'how_it_works',
      campaign: CAMPAIGN,
    })
    navigate('/how-it-works')
  }

  return (
    <div className="overflow-x-clip bg-background">
      <StickyCTA
        text="Put your AI’s rules in one place · Open source"
        mobileText="Put your AI’s rules in one place · Open source"
        buttonText="View on GitHub"
        location="blueprints_sticky"
        campaign={CAMPAIGN}
      />

      {/* 1 — Hero */}
      <HeroSection
        eyebrow="Blueprints · your AI’s rules, in one place"
        heading="Stop re-explaining your standards to every AI tool."
        subcopy={
          <>
            Your coding rules live in <span className="font-mono">CLAUDE.md</span>{' '}
            here, <span className="font-mono">.cursorrules</span> there,{' '}
            <span className="font-mono">AGENTS.md</span> somewhere else —
            scattered across repos and tools. Blueprints keeps every rule that
            shapes your AI in one versioned, team-shared library: import straight
            from GitHub, organize it per tool, and reach it from everywhere you
            work.
          </>
        }
        primaryAction={{
          label: 'View on GitHub',
          testId: 'blueprints-hero-cta',
          onClick: () => handleViewOnGitHub('blueprints_hero'),
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: () => handleSeeHowItWorks('blueprints_hero'),
        }}
        reassurance="Free and open source · Self-host it · Works with the tools you already use"
        media={<HeroBlueprintGraph />}
      />

      {/* 2 — Works-with strip */}
      <Section className="bg-background pt-0" data-testid="works-with-strip">
        <Container>
          <p className="text-center type-overline text-muted-foreground">
            Configures the AI tools you already use
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-9 gap-y-5">
            {TOOLS.map(tool => (
              <span
                key={tool.name}
                className="inline-flex items-center gap-2.5 text-sm font-semibold text-muted-foreground"
              >
                <span className="h-[19px] w-[19px]" aria-hidden="true">
                  {tool.icon}
                </span>
                {tool.name}
              </span>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3 — Problem */}
      <Section className="bg-muted" data-testid="problem-section">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="type-section">
              Every AI tool wants its own rules file.
            </h2>
            <p className={cn('mt-4', 'type-lead')}>
              The standards that should be one source of truth end up copied into
              five — and they never stay in sync.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PROBLEM_CARDS.map(card => (
              <div
                key={card.title}
                className="flex h-full flex-col rounded-xl border border-border bg-card p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted text-foreground [&_svg]:h-5 [&_svg]:w-5">
                  {card.icon}
                </span>
                <h3 className="type-card-title mt-4">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4 — Solution / What is Blueprints */}
      <Section className="bg-background" data-testid="solution-section" id="solution">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <PillEyebrow>What is Blueprints</PillEyebrow>
              <h2 className="type-section mt-4">
                One library for every rule your AI follows.
              </h2>
              <p className={cn('mt-4', 'type-lead')}>
                Blueprints is the versioned, team-shared home for your AI’s
                standards and config — organized per tool, searchable, and
                reachable everywhere your AI works. One place to keep your coding
                standards, instruction files, and tool config, instead of five.
              </p>
            </div>
            <div className="w-full min-w-0">
              <SolutionHubIllustration />
            </div>
          </div>

          <div className="mt-14">
            <ClarifierBlock />
          </div>
        </Container>
      </Section>

      {/* 5 — GitHub import (LEAD feature) */}
      <FeatureBand
        muted
        testId="github-import-section"
        eyebrow={<LeadFeatureEyebrow />}
        heading="Already wrote the rules? Import them in one click."
        body={
          <>
            Connect your GitHub repo and VibeXP pulls in your existing AI-config
            files — <code className="bp-code">CLAUDE.md</code>,{' '}
            <code className="bp-code">AGENTS.md</code>,{' '}
            <code className="bp-code">.cursorrules</code>, plus everything under{' '}
            <code className="bp-code">.claude/</code>,{' '}
            <code className="bp-code">.cursor/</code>,{' '}
            <code className="bp-code">.codex/</code>, and{' '}
            <code className="bp-code">.agents/</code> — and automatically sorts
            each one by tool and kind. No copy-paste, no reformatting.
          </>
        }
        bullets={IMPORT_BULLETS}
        media={<GithubImportIllustration />}
      />

      {/* 6 — Organized per tool (media left) */}
      <FeatureBand
        reverse
        testId="organized-section"
        eyebrow={<OverlineEyebrow>Organized per tool</OverlineEyebrow>}
        heading="Sorted by the tool it configures."
        body="Every blueprint is typed for the tool it belongs to — Claude Code, Claude, Cursor, or Codex — so you (and your AI) always reach the right rules for the right tool. Filter, search, and group by project."
        bullets={ORGANIZE_BULLETS}
        media={<ToolColumnsIllustration />}
      />

      {/* 7 — Version history */}
      <FeatureBand
        muted
        testId="version-history-section"
        eyebrow={<OverlineEyebrow>Version history</OverlineEyebrow>}
        heading="Your rules change. Track every change, restore any version."
        body="Standards evolve. VibeXP snapshots every edit with who changed it and when — diff any two versions side by side and roll back safely. No more “who loosened this rule, and when?”"
        bullets={VERSION_BULLETS}
        media={<VersionHistoryIllustration />}
      />

      {/* 8 — Use anywhere (dark MCP band) */}
      <Section
        className="bg-primary text-primary-foreground"
        data-testid="mcp-section"
        id="connect"
      >
        <Container>
          <div className="px-art">
            <div className="mcp-grid">
              <div className="mcp-copy">
                <span className="noapi">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  OAuth only · no API key
                </span>
                <h2 className="type-section">
                  One set of rules, every tool you use.
                </h2>
                <p>
                  Your AI pulls the right rules from your library over one MCP
                  connection — Claude Code, Cursor, Codex — and you can reach them
                  from the CLI and API too. Update a rule once; everywhere that
                  uses it stays current.
                </p>
                <CopyEndpoint />
                <div className="mcp-steps">
                  {MCP_STEPS.map((step, index) => (
                    <div className="mcp-step" key={step.title}>
                      <span className="n" aria-hidden="true">
                        {index + 1}
                      </span>
                      <span className="t">
                        <b>{step.title}</b> <span>{step.description}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mcp-hub-wrap">
                <McpHubIllustration />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 9 — Find + analytics */}
      <Section className="bg-muted" data-testid="find-section">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="type-section">
              Find the right rule. Know which ones matter.
            </h2>
            <p className={cn('mt-4', 'type-lead')}>
              Search your whole knowledge base by meaning — and see which
              standards your workflow actually leans on, broken down by channel.
            </p>
          </div>
          <div className="px-art mt-12">
            <div className="find-grid">
              <SemanticSearchIllustration />
              <UsageChartIllustration />
            </div>
          </div>
        </Container>
      </Section>

      {/* 10 — Solo → Team */}
      <Section className="bg-background" data-testid="solo-team-section" id="solo-team">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="min-w-0 lg:order-2">
              <h2 className="type-section">
                Better on your own. Unstoppable with your team.
              </h2>
              <ul className="mt-6 space-y-4">
                <li className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Start solo.
                  </span>{' '}
                  Import your rules today — every session starts from your
                  standards, not a blank slate you re-explain.
                </li>
                <li className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Expand to your team.
                  </span>{' '}
                  Blueprints live in a shared workspace — everyone’s AI follows
                  the same standards, every change is attributed, and new
                  teammates inherit your conventions on day one instead of
                  guessing.
                </li>
              </ul>
              <Link
                to="/features"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                Explore features
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="w-full min-w-0 lg:order-1">
              <SoloTeamIllustration />
            </div>
          </div>
        </Container>
      </Section>

      {/* 12 — FAQ */}
      <FAQSection
        heading="Questions, answered"
        subheading="Everything you need to know before you put your AI’s rules in one place."
        faqs={FAQS}
      />

      {/* 13 — Final CTA */}
      <CTASection
        heading="Give your AI one set of rules to follow."
        description="Import your scattered rules files, organize them per tool, and reach them from everywhere you work. Free and open source — self-host it."
        primaryAction={{
          label: 'View on GitHub',
          onClick: () => handleViewOnGitHub('blueprints_final'),
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: () => handleSeeHowItWorks('blueprints_final'),
        }}
      />
      <div className="bg-muted pb-12 text-center md:pb-16 lg:pb-20">
        <Container>
          <p className="mx-auto max-w-md text-xs text-muted-foreground sm:text-sm">
            Free and open source · Self-host it · Works with the tools you already use
          </p>
        </Container>
      </div>
    </div>
  )
}
