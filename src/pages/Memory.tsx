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

import './Memory.illustrations.css'

// Campaign slug shared by every CTA on this page (UTM params + `cta_click`
// event), per the issue's analytics requirement (§7). CTA surfaces are
// distinguished by `location` (memory_hero / memory_final / memory_sticky),
// mirroring the site-wide "utm_medium = surface" convention and Blueprints.tsx.
const CAMPAIGN = 'memory'

/* ------------------------------------------------------------------ */
/* Reusable inline-SVG icons (monochrome, currentColor) shared across the
   works-with strip and the ported illustrations. */
/* ------------------------------------------------------------------ */

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
const IconVSCode = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
  </svg>
)
const IconGemini = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinejoin="round"
  >
    <path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2Z" />
  </svg>
)
const IconCLI = (
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
const IconAPI = (
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
/** Brain (memory) glyph — two halves; the canonical Memory mark. */
const IconBrain = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
  </svg>
)
const IconBrainCircuit = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
  </svg>
)
const IconChatGPT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
)
const IconCodex = (
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
)
const IconMCP = (
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
)
const IconArrowRight = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)
const IconArrowLeft = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
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
const IconCheckBold = (
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

// The AI tools Memory reads/writes across, shown as a "works with" strip under
// the hero (§5.2). Inline monochrome currentColor SVGs.
const TOOLS: { name: string; icon: ReactNode }[] = [
  { name: 'Claude Code', icon: IconClaudeCode },
  { name: 'Cursor', icon: IconCursor },
  { name: 'VS Code', icon: IconVSCode },
  { name: 'Gemini CLI', icon: IconGemini },
  { name: 'ChatGPT', icon: IconChatGPT },
  { name: 'Codex', icon: IconCodex },
  { name: 'MCP', icon: IconMCP },
]

// The three problem cards (§5.3): why AI forgets between sessions.
const PROBLEM_CARDS: { icon: ReactNode; title: string; body: string }[] = [
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
    title: 'You re-explain your context, constantly',
    body: 'Every new session starts cold. You re-describe your project, your stack, and your standards to every tool, every time.',
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
        <path d="M12 8v4l2 2" />
        <path d="M3.05 11a9 9 0 1 1 .5 4" />
        <path d="M3 4v4h4" />
      </svg>
    ),
    title: 'Nothing carries over',
    body: 'What your AI figured out yesterday is gone today. You’re its memory — manually, on repeat — copying context from chat to chat.',
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
        <rect width="18" height="11" x="3" y="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Built-in memory is locked in one tool',
    body: 'Claude’s memory doesn’t help in Cursor. Your context is trapped per-app, per-account — never shared across your tools or your team.',
  },
]

// The three loop steps (§5.5): read → work → write back.
const LOOP_STEPS: {
  icon: ReactNode
  tag: string
  title: string
  body: string
}[] = [
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
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    tag: 'Read',
    title: 'Before a task',
    body: 'Your AI reads the relevant memory, prompts, rules, and past work first — so it starts with everything already learned, not a blank slate.',
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
        <path d="m12 14 4-4" />
        <path d="M3.34 19a10 10 0 1 1 17.32 0" />
      </svg>
    ),
    tag: 'Work',
    title: 'As it works',
    body: 'It saves new lessons and updates memory, storing what it learns back into VibeXP through the MCP write tools — an explicit step the agent takes, not a guess.',
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
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
    tag: 'Write back',
    title: 'Every session after',
    body: 'That richer context is waiting — for you and your teammates. The whole team’s AI compounds, every session a little smarter than the last.',
  },
]

// The three MCP setup steps (verbatim from §5.8).
const MCP_STEPS: { title: string; description: string }[] = [
  {
    title: 'Copy the endpoint.',
    description: 'The same one works for every AI tool you connect.',
  },
  {
    title: 'Add it to your AI tool.',
    description: 'Paste it into Claude Code, Cursor, VS Code, or Gemini.',
  },
  {
    title: 'Sign in and pick a workspace.',
    description:
      'Authorize in the browser — your AI now reads memory on demand and writes new learnings back.',
  },
]

// FAQ answers are plain strings rendered by the shared shadcn accordion
// (FAQSection). Copy verbatim from §5.14, with the version-history answer’s
// per-agent MCP-attribution clause dropped per §8/§9 (product does not attribute
// versions to a specific AI tool).
const FAQS: { q: string; a: string }[] = [
  {
    q: 'How does my AI actually “remember”?',
    a: 'Two explicit steps over MCP. Before a task, your AI agent searches your memory by meaning and pulls the relevant context. As it works, it calls create_memory / update_memory to write new lessons back. The only automatic part is the embedding: the moment a memory is saved it’s indexed so the next search finds it. VibeXP doesn’t silently watch your sessions or inject memories into your chats — your AI reads and writes deliberately.',
  },
  {
    q: 'How is this different from the memory built into Claude or ChatGPT?',
    a: 'Built-in memory lives inside one tool and one account. VibeXP is shared across every tool you use — Claude Code, Cursor, VS Code, Gemini, plus Web, CLI, and API — and across everyone on your team. Context never gets stranded in one app, and your team’s knowledge compounds in one place.',
  },
  {
    q: 'What can I store as a memory?',
    a: 'Anything worth remembering — a fact, a decision, a snippet, a preference, a lesson learned. A memory is free-form text (Markdown-rendered) plus tags, scoped to a project. No title required: you (or your AI) just capture it and it’s saved and searchable. That’s what makes it the fastest, most AI-native primitive in VibeXP.',
  },
  {
    q: 'Can my team share memories?',
    a: 'Yes. Memories live in your team’s shared workspace, so everyone’s AI reads from and contributes to the same growing memory. New teammates inherit the team’s context on day one instead of starting from scratch.',
  },
  {
    q: 'Can I track and roll back changes?',
    a: 'Yes. Every change is snapshotted with author and timestamp. Search the timeline, compare any two versions, and restore an earlier one non-destructively (a restore is itself a new version, so nothing is lost).',
  },
  {
    q: 'Do I need an API key?',
    a: 'No. MCP integration is OAuth-only — you connect one endpoint (https://connect.vibexp.io/mcp/v1/common) and sign in through the browser. Nothing to copy, paste, and babysit.',
  },
  {
    q: 'Is VibeXP free?',
    a: 'Yes — VibeXP is free and open source. Self-host it with MCP access included and keep as many memories as you need.',
  },
]

interface Bullet {
  title: string
  description: string
}

const CAPTURE_BULLETS: Bullet[] = [
  {
    title: 'Free-form, Markdown-rendered.',
    description:
      'Just the text plus tags, scoped to a project — deliberately simpler than the Prompts and Blueprints editors.',
  },
  {
    title: 'Embedded the instant it’s saved.',
    description:
      'Every new memory is auto-indexed so the next semantic search — yours or an agent’s — finds it. No manual indexing step.',
  },
]

const SEARCH_BULLETS: Bullet[] = [
  {
    title: 'RAG across your whole knowledge base.',
    description:
      'One query reaches every kind of saved knowledge, ranked by meaning.',
  },
  {
    title: 'The same retrieval your AI uses.',
    description:
      'Agents call this over MCP to pull context before they work — you’re searching the exact index they do.',
  },
]

const VERSION_BULLETS: Bullet[] = [
  {
    title: 'Author attribution on every snapshot.',
    description: 'A timestamped, searchable timeline.',
  },
  {
    title: 'Compare & non-destructive restore.',
    description:
      'Diff any two versions; restoring is itself a new version, so nothing is ever lost.',
  },
]

const ANALYTICS_BULLETS: Bullet[] = [
  {
    title: 'Split by channel.',
    description:
      'See the MCP slice grow as your agents lean on a memory — the cross-tool wedge, made visible.',
  },
  {
    title: 'Know what matters.',
    description:
      'The memories your workflow actually leans on rise to the top.',
  },
]

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

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
 * Capture, Find-by-meaning, Version-history, and Cross-tool-proof sections —
 * mirroring the FeatureBand from the Prompts/Blueprints pages.
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
/* Illustrations — ported verbatim from the approved #1902 prototype
   (exact geometry/markup), styled by Memory.illustrations.css under the
   .px-art scope. Monochrome, design-system tokens, light-only, aria-hidden. */
/* ------------------------------------------------------------------ */

/** #1 — The Loop: Read → Work → Write back around a compounding core.
 *  Used in the hero and again in the loop band; `idSuffix` keeps the SVG
 *  filter/mask ids unique between the two instances on one page. */
function LoopFigure({
  idSuffix,
  caption,
}: {
  idSuffix: string
  caption: string
}) {
  const chip = `cChip${idSuffix}`
  const hub = `cHub${idSuffix}`
  const cut = `cCut${idSuffix}`
  return (
    <figure className="loop-figure">
      <svg
        className="loop-svg"
        viewBox="0 0 480 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id={chip} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="5"
              floodColor="#000000"
              floodOpacity=".07"
            />
          </filter>
          <filter id={hub} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="11"
              floodColor="#000000"
              floodOpacity=".22"
            />
          </filter>
          <mask id={cut} maskUnits="userSpaceOnUse" x="211" y="189" width="58" height="52">
            <rect x="211" y="189" width="58" height="52" rx="15" fill="#ffffff" />
            <svg x="219" y="201" width="42" height="33" viewBox="118 150 276 212" overflow="visible">
              <path
                d="M128 256h48l32-96 64 192 32-96h48"
                fill="none"
                stroke="#000000"
                strokeWidth="42"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </mask>
        </defs>
        <g fill="none" stroke="currentColor">
          <circle cx="240" cy="215" r="46" strokeOpacity=".16" />
          <circle cx="240" cy="215" r="68" strokeOpacity=".09" />
          <circle cx="240" cy="215" r="92" strokeOpacity=".045" />
        </g>
        <g
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
          style={{ stroke: 'var(--primary, currentColor)' }}
        >
          <path className="loop-arc" d="M262 113.1Q349 147.8 337.2 243.4" />
          <path className="loop-arc" d="M317.2 285Q243.7 343 166.8 285" />
          <path className="loop-arc" d="M140.8 246.9Q127.4 154.2 216 116.6" />
        </g>
        <g style={{ fill: 'var(--primary, currentColor)' }}>
          <path d="M337.2 243.4L333.5 232.9L343.4 234.1Z" />
          <path d="M166.8 285L177.8 287L171.8 295Z" />
          <path d="M216 116.6L208.8 125.1L204.8 115.9Z" />
        </g>
        <g filter={`url(#${hub})`}>
          <rect
            x="211"
            y="189"
            width="58"
            height="52"
            rx="15"
            mask={`url(#${cut})`}
            style={{ fill: 'var(--primary, currentColor)' }}
          />
        </g>
        <g filter={`url(#${chip})`}>
          <circle cx="240" cy="75" r="38" fill="currentColor" fillOpacity=".04" />
          <circle cx="361.2" cy="285" r="38" fill="currentColor" fillOpacity=".04" />
          <circle cx="118.8" cy="285" r="38" fill="currentColor" fillOpacity=".04" />
        </g>
        <g fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth="1.4">
          <circle cx="240" cy="75" r="38" />
          <circle cx="361.2" cy="285" r="38" />
          <circle cx="118.8" cy="285" r="38" />
        </g>
        <g
          transform="translate(240 75)"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M-9 -12 H5 L10 -7 V12 H-9 Z" />
          <path d="M5 -12 V-7 H10" />
          <line x1="-5" y1="-2" x2="6" y2="-2" />
          <line x1="-5" y1="2" x2="6" y2="2" />
          <line x1="-5" y1="6" x2="2" y2="6" />
        </g>
        <path
          transform="translate(361.2 285)"
          d="M0 -11 C1.5 -4.5 4.5 -1.5 11 0 C4.5 1.5 1.5 4.5 0 11 C-1.5 4.5 -4.5 1.5 -11 0 C-4.5 -1.5 -1.5 -4.5 0 -11 Z"
          fill="currentColor"
        />
        <g
          transform="translate(118.8 285)"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="0" y1="-12" x2="0" y2="4" />
          <path d="M-5 -1 L0 4 L5 -1" />
          <path d="M-10 9 H10" />
        </g>
        <g
          fill="currentColor"
          opacity=".62"
          fontSize="13"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
        >
          <text x="240" y="22">
            Read
          </text>
          <text x="361.2" y="343">
            Work
          </text>
          <text x="118.8" y="343">
            Write back
          </text>
        </g>
      </svg>
      <figcaption className="lf-cap">{caption}</figcaption>
    </figure>
  )
}

/** #2 — Solution hub: a Memory core that reads from and writes back to tools. */
function SolutionHub() {
  return (
    <div className="solu-hub" aria-hidden="true">
      <svg
        className="compose-lines"
        viewBox="0 0 420 356"
        preserveAspectRatio="xMidYMid meet"
      >
        <g fill="none" strokeLinecap="round">
          <path className="flow" d="M140 168 C 230 168, 250 64, 318 64" />
          <path className="flow back" d="M318 78 C 250 78, 240 188, 140 188" />
          <path className="flow" d="M140 174 C 240 174, 260 222, 318 222" />
          <path className="flow back" d="M318 236 C 260 236, 240 184, 140 184" />
          <path className="flow" d="M140 178 C 230 178, 250 292, 318 292" />
        </g>
      </svg>
      <div className="mem-core">
        <div className="lc-h">
          {IconBrainCircuit}
          Memory
        </div>
        <div className="lc-row a" />
        <div className="lc-row" />
        <div className="lc-row a" />
        <div className="lc-row" />
      </div>
      <span className="rw-chip" style={{ left: '46%', top: '23%' }}>
        {IconArrowRight}
        reads
      </span>
      <span className="rw-chip" style={{ left: '44%', top: '55%' }}>
        {IconArrowLeft}
        writes back
      </span>
      <div className="tool-node" style={{ left: '76%', top: '18%' }}>
        {IconClaudeCode}
        <small>Claude Code</small>
      </div>
      <div className="tool-node" style={{ left: '76%', top: '50%' }}>
        {IconCursor}
        <small>Cursor</small>
      </div>
      <div className="tool-node" style={{ left: '76%', top: '82%' }}>
        {IconVSCode}
        <small>VS Code</small>
      </div>
    </div>
  )
}

/** #3 — Prompts/Blueprints vs Memory clarifier (holds real copy — not hidden). */
function Clarifier() {
  return (
    <>
      <p className="clarify-line">
        Prompts and Blueprints are what you give your AI.{' '}
        <em>Memory is what it gives back.</em>
      </p>
      <div className="clarify">
        <div className="cc">
          <div className="ch">
            <span className="ci" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
              </svg>
            </span>
            <span className="ck">
              Prompts &amp; Blueprints<small>What you give it</small>
            </span>
          </div>
          <p>
            The instructions you author — reusable prompts and the standing rules
            your AI follows. Titled, structured, human-written.{' '}
            <Link to="/features/prompts">Explore Prompts →</Link>
          </p>
        </div>
        <div className="cc is-mem">
          <div className="ch">
            <span className="ci" aria-hidden="true">
              {IconBrain}
            </span>
            <span className="ck">
              Memory<small>What it gives back</small>
            </span>
          </div>
          <p>
            The dynamic, self-growing layer the AI writes to itself — free-form
            facts, decisions, and learnings it captures as it works, then reads
            back next time.
          </p>
        </div>
      </div>
    </>
  )
}

/** #5 — Competitive wedge: built-in silo vs VibeXP radiate. */
function WedgeBuiltinViz() {
  return (
    <div className="wviz" aria-hidden="true">
      <div className="silo">
        <span className="lock">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <span className="snode">{IconChatGPT}</span>
        <span className="sline" />
        <span className="sperson">{IconUser}</span>
        <span className="scap">One tool · One account</span>
      </div>
    </div>
  )
}

function WedgeVibeViz() {
  return (
    <div className="wviz" aria-hidden="true">
      <div className="radiate">
        <svg className="rlines" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet">
          <g fill="none" strokeLinecap="round">
            <path className="flow" d="M180 100 L70 40" />
            <path className="flow" d="M180 100 L70 100" />
            <path className="flow" d="M180 100 L70 160" />
            <path className="flow" d="M180 100 L290 40" />
            <path className="flow" d="M180 100 L290 100" />
            <path className="flow" d="M180 100 L290 160" />
          </g>
        </svg>
        <span className="rcore">{IconBrain}</span>
        <span className="rn" style={{ left: '19%', top: '20%' }}>
          {IconClaudeCode}
        </span>
        <span className="rn" style={{ left: '19%', top: '50%' }}>
          {IconCursor}
        </span>
        <span className="rn" style={{ left: '19%', top: '80%' }}>
          {IconVSCode}
        </span>
        <span className="rn person" style={{ left: '81%', top: '20%' }}>
          {IconUser}
        </span>
        <span className="rn person" style={{ left: '81%', top: '50%' }}>
          {IconUser}
        </span>
        <span className="rn person" style={{ left: '81%', top: '80%' }}>
          {IconUser}
        </span>
      </div>
    </div>
  )
}

/** #6 — Capture card: a free-text, title-less memory with tags + project. */
function CaptureCard() {
  return (
    <div className="dia">
      <div className="cap" aria-hidden="true">
        <div className="cap-card">
          <div className="cap-top">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            New memory
            <span className="proj">
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
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
              payments-api
            </span>
          </div>
          <div className="cap-body">
            The Postgres connection pool maxes out at 20 under load — bumping{' '}
            <code>pool_max</code> to 50 fixed the request timeouts during the
            Tuesday traffic spike.
            <span className="cur" />
          </div>
          <div className="cap-foot">
            <div className="cap-tags">
              <span className="cap-tag">
                <span className="h">#</span>postgres
              </span>
              <span className="cap-tag">
                <span className="h">#</span>infra
              </span>
              <span className="cap-tag">
                <span className="h">#</span>perf
              </span>
            </div>
            <span className="cap-saved">
              {IconCheckBold}
              Saved · searchable
            </span>
          </div>
        </div>
        <div className="cap-compare">
          <span>
            <b>Memory</b> — text + tags + project
          </span>
          <span className="ar">{IconArrowRight}</span>
          <span>No title, no structure to fill in — that’s the point.</span>
        </div>
      </div>
    </div>
  )
}

/** #7 — Dark MCP band bidirectional hub: reads context / writes learnings back. */
function McpHub() {
  return (
    <>
      <div className="mcp-hub" aria-hidden="true">
        <svg className="mcp-hub-lines" viewBox="0 0 380 380" preserveAspectRatio="xMidYMid meet">
          <g fill="none" strokeLinecap="round">
            <path className="flow" d="M190 190 L190 64" />
            <path className="flow back" d="M198 64 L198 190" />
            <path className="flow" d="M190 190 L300 127" />
            <path className="flow back" d="M300 135 L190 198" />
            <path className="flow" d="M190 190 L300 253" />
            <path className="flow" d="M190 190 L190 316" />
            <path className="flow back" d="M182 316 L182 190" />
            <path className="flow" d="M190 190 L80 253" />
            <path className="flow" d="M190 190 L80 127" />
          </g>
        </svg>
        <div className="mcp-core">
          {IconBrain}
          <span>Memory</span>
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
          {IconVSCode}
          <small>VS Code</small>
        </div>
        <div className="mcp-node" style={{ left: '50%', top: '84%' }}>
          {IconGemini}
          <small>Gemini</small>
        </div>
        <div className="mcp-node" style={{ left: '21%', top: '67%' }}>
          {IconCLI}
          <small>CLI</small>
        </div>
        <div className="mcp-node" style={{ left: '21%', top: '33%' }}>
          {IconAPI}
          <small>API</small>
        </div>
      </div>
      <div className="rw-legend">
        <span className="rwl">
          {IconArrowRight}
          reads context
        </span>
        <span className="rwl">
          {IconArrowLeft}
          writes learnings back
        </span>
      </div>
    </>
  )
}

/** #8 — Semantic search: query → ranked cross-resource results. */
function SemanticSearch() {
  return (
    <div className="dia">
      <div className="dia-h">
        {IconSearch}
        Semantic search<span className="sub">by meaning, not keywords</span>
      </div>
      <div className="srch-bar" aria-hidden="true">
        {IconSearch}
        <span className="q">
          why do <em>requests time out under heavy load?</em>
        </span>
      </div>
      <div className="sresult" aria-hidden="true">
        <div className="srow best">
          <span className="si">{IconBrain}</span>
          <div className="sb">
            <div className="sd">
              “Postgres pool maxes out at 20 under load — bump{' '}
              <span className="mono">pool_max</span> to 50 to fix request
              timeouts.”
            </div>
            <div className="sm">
              <span className="tg">#postgres</span>
              <span className="tg">#infra</span>
              <span className="tg">#perf</span>
            </div>
          </div>
          <span className="score">0.93</span>
        </div>
        <div className="srow">
          <span className="si">{IconBrain}</span>
          <div className="sb">
            <div className="sd">
              “Background jobs share the web pool — move them to a separate
              connection pool.”
            </div>
            <div className="sm">
              <span className="tg">#infra</span>
              <span className="tg">#jobs</span>
            </div>
          </div>
          <span className="score">0.78</span>
        </div>
        <div className="srow">
          <span className="si">
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
          </span>
          <div className="sb">
            <div className="sd">
              “Set sensible statement timeouts on all DB queries.”{' '}
              <span style={{ color: 'var(--muted-foreground)' }}>
                — backend blueprint
              </span>
            </div>
            <div className="sm">
              <span className="tg">Blueprint</span>
              <span className="tg">#database</span>
            </div>
          </div>
          <span className="score">0.71</span>
        </div>
      </div>
    </div>
  )
}

/** #9 — Version history: timeline (person attribution per §8) + unified diff. */
function VersionHistory() {
  return (
    <div className="dia">
      <div className="vh-grid">
        <ul className="timeline" aria-hidden="true">
          <li className="cur">
            <span className="dot" />
            <div className="vrow">
              <span className="vtag">v4</span>
              <span className="pill">Current</span>
            </div>
            <div className="meta">
              <b>You</b> · 2m ago
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
              <span className="vtag">v3</span>
              <span className="pill ghost">Edited</span>
            </div>
            <div className="meta">
              <b>You</b> · 3d ago
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
              <span className="vtag">v2</span>
            </div>
            <div className="meta">
              <b>S. Rahman</b> · 6d ago
            </div>
          </li>
        </ul>
        <div className="diff" aria-hidden="true">
          <div className="dh">
            <span>Memory · v3 → v4</span>
            <span className="seg">
              <span>Split</span>
              <span className="on">Unified</span>
            </span>
          </div>
          <div className="dbody">
            <div className="dl">
              <span className="gut">{' '}</span>
              <span>Postgres pool maxes out at 20 under load.</span>
            </div>
            <div className="dl del">
              <span className="gut">-</span>
              <span>Bump pool_max to 40.</span>
            </div>
            <div className="dl add">
              <span className="gut">+</span>
              <span>Bump pool_max to 50 (40 still timed out).</span>
            </div>
            <div className="dl add">
              <span className="gut">+</span>
              <span>Move background jobs off the web pool.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** #9b — Cross-tool analytics: reads-per-memory stacked bars + channel legend. */
function UsageChart() {
  const bars: { bv: string; h: string; segs: [string, string, string, string]; bl: string }[] = [
    { bv: '142', h: '90%', segs: ['18%', '18%', '52%', '12%'], bl: 'Postgres pool limit' },
    { bv: '98', h: '66%', segs: ['20%', '26%', '42%', '12%'], bl: 'IDs are ULIDs' },
    { bv: '73', h: '50%', segs: ['24%', '18%', '44%', '14%'], bl: 'Deploy window' },
    { bv: '51', h: '36%', segs: ['30%', '16%', '40%', '14%'], bl: 'Prefer pnpm' },
    { bv: '28', h: '22%', segs: ['26%', '24%', '36%', '14%'], bl: 'Webhook retries' },
  ]
  return (
    <div className="dia">
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
        Reads per memory<span className="sub">last 30 days</span>
      </div>
      <div className="usage" aria-hidden="true">
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
    <div className="team-vis" aria-hidden="true">
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
  )
}

/** Copyable MCP endpoint with an accessible copied state (dark band). */
function CopyEndpoint() {
  const [copied, setCopied] = useState(false)
  const endpoint = 'https://connect.vibexp.io/mcp/v1/common'

  const handleCopy = () => {
    void navigator.clipboard?.writeText(endpoint)
    trackEvent('copy_mcp_endpoint', { location: 'memory_mcp' })
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

export function Memory() {
  const navigate = useNavigate()

  // SEO. Page-view tracking is handled once at the App level via
  // usePageTracking(); calling it here would double-count page_view.
  useSEO(getPageSEO('memoryManagement'))

  // Opens the public GitHub repo with surface-scoped UTM params and fires
  // `cta_click`. VibeXP is free and open source — every primary CTA points to
  // the repo rather than a hosted app.
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
        text="Give your AI a memory that compounds · Open source"
        mobileText="Give your AI a memory that compounds · Open source"
        buttonText="View on GitHub"
        location="memory_sticky"
        campaign={CAMPAIGN}
      />

      {/* 1 — Hero */}
      <HeroSection
        eyebrow="Memory · the context your AI builds on"
        heading="Stop re-explaining everything to your AI."
        subcopy="Memory is the central place your AI writes down what it learns and reads back before the next task — so every session starts smarter than the last, across every tool you use and your whole team."
        primaryAction={{
          label: 'View on GitHub',
          testId: 'memory-hero-cta',
          onClick: () => handleViewOnGitHub('memory_hero'),
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: () => handleSeeHowItWorks('memory_hero'),
        }}
        reassurance="Free and open source · Self-host it · Works with the tools you already use"
        media={
          <div className="px-art">
            <LoopFigure
              idSuffix="Hero"
              caption="Read → work → write back — each session starts richer than the last."
            />
          </div>
        }
      />

      {/* 2 — Works-with strip */}
      <Section className="bg-background pt-0" data-testid="works-with-strip">
        <Container>
          <p className="text-center type-overline text-muted-foreground">
            Reads and writes across the tools you already use
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
              Your AI forgets everything between sessions.
            </h2>
            <p className={cn('mt-4', 'type-lead')}>
              Every new chat starts from zero. You become your AI’s memory —
              manually, on repeat, in every tool.
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

      {/* 4 — Solution / What is Memory */}
      <Section className="bg-background" data-testid="solution-section" id="solution">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <PillEyebrow>What is Memory</PillEyebrow>
              <h2 className="type-section mt-4">
                One memory. Every tool. It writes its own.
              </h2>
              <p className={cn('mt-4', 'type-lead')}>
                Memory is the shared, growing context your AI reads before it
                works and writes back as it learns — so your knowledge improves
                itself instead of resetting to zero. Not another file you
                maintain by hand: the dynamic layer your AI keeps current for you.
              </p>
            </div>
            <div className="w-full min-w-0">
              <div className="px-art rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
                <SolutionHub />
              </div>
            </div>
          </div>

          <div className="px-art mt-14">
            <Clarifier />
          </div>
        </Container>
      </Section>

      {/* 5 — The Loop band (signature) */}
      <Section className="bg-muted" data-testid="loop-section" id="loop">
        <Container>
          <div className="px-art">
            <div className="loop-grid">
              <div className="min-w-0">
                <PillEyebrow>The loop</PillEyebrow>
                <h2 className="type-section mt-4">
                  Your AI doesn’t just use your knowledge. It builds it.
                </h2>
                <p className={cn('mt-4', 'type-lead', 'max-w-[46ch]')}>
                  Because your tools connect over MCP, your AI reads your saved
                  knowledge and writes back to it. Your knowledge base improves
                  itself as you work — for you and everyone on your team.
                </p>
                <ul className="loop-steps mt-8">
                  {LOOP_STEPS.map(step => (
                    <li className="loop-step" key={step.tag}>
                      <div className="lst">
                        <span className="lsn" aria-hidden="true">
                          {step.icon}
                        </span>
                        <span className="lstag">{step.tag}</span>
                      </div>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="loop-vis w-full min-w-0">
                <LoopFigure
                  idSuffix="Band"
                  caption="Each loop leaves the knowledge base richer — the rings compound."
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 6 — Competitive wedge band */}
      <Section className="bg-background" data-testid="wedge-section">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="type-section">
              Built-in AI memory is one tool, one person.{' '}
              <span className="mt-2 block text-[0.62em] font-semibold text-muted-foreground">
                VibeXP is every tool you use, and your whole team.
              </span>
            </h2>
            <p className={cn('mx-auto mt-4', 'type-lead', 'max-w-[60ch]')}>
              Memory inside Claude or ChatGPT lives in one app and one account.
              VibeXP’s memory follows you across every tool and is shared with
              your whole team — so context never gets stranded and your team’s
              knowledge compounds.
            </p>
          </div>
          <div className="px-art mt-12">
            <div className="wedge-grid">
              <div className="wcard is-builtin">
                <span className="wlabel">
                  <span className="wdot" />
                  Built-in memory
                </span>
                <h3>Trapped in one app, one account.</h3>
                <WedgeBuiltinViz />
                <p className="wnote">
                  Switch tools and the context is gone. Nothing your AI learned
                  in one app reaches the next — and none of it is shared with
                  your team.
                </p>
              </div>
              <div className="wcard is-vibe">
                <span className="wlabel">
                  <span className="wdot" />
                  VibeXP Memory
                </span>
                <h3>One memory, every tool, your whole team.</h3>
                <WedgeVibeViz />
                <p className="wnote">
                  One shared memory every tool reads and writes — and every
                  teammate’s AI draws from the same growing context. Cross-tool,
                  cross-team, and self-improving.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 7 — Capture in seconds */}
      <FeatureBand
        muted
        testId="capture-section"
        eyebrow={<OverlineEyebrow>Capture in seconds</OverlineEyebrow>}
        heading="No title. No template. Just capture it."
        body="Memory is the fastest thing in VibeXP — drop in a fact, a decision, a snippet, or a preference, tag it, and it’s instantly searchable. You or your AI; from web, CLI, or agent. No name field to fill, no form to wrangle."
        bullets={CAPTURE_BULLETS}
        media={
          <div className="px-art">
            <CaptureCard />
          </div>
        }
      />

      {/* 8 — Read & write over MCP (dark band) */}
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
                  Your AI reads it before. Writes it after. Over one connection.
                </h2>
                <p>
                  Connect once over MCP and your AI tools — Claude Code, Cursor,
                  VS Code, Gemini — both pull context from your memory and save
                  new learnings back to it via <code>create_memory</code> and{' '}
                  <code>update_memory</code>. Or reach the same memory from the
                  CLI and API.
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
              <div className="mcp-hub-wrap min-w-0">
                <McpHub />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 9 — Find by meaning */}
      <FeatureBand
        testId="find-section"
        eyebrow={<OverlineEyebrow>Find by meaning</OverlineEyebrow>}
        heading="Search your context by meaning, not keywords."
        body="Semantic search finds the right memory even when you don’t remember the exact words — across memories, prompts, blueprints, and artifacts, scoped to your team. Keyword, tag, and metadata filters are there too."
        bullets={SEARCH_BULLETS}
        media={
          <div className="px-art">
            <SemanticSearch />
          </div>
        }
      />

      {/* 10 — Version history (media left) */}
      <FeatureBand
        reverse
        muted
        testId="version-history-section"
        eyebrow={<OverlineEyebrow>Version history</OverlineEyebrow>}
        heading="Every change tracked. Any version restored."
        body="Memory evolves as your project does. VibeXP snapshots every change with who made it and when — compare versions and roll back safely."
        bullets={VERSION_BULLETS}
        media={
          <div className="px-art">
            <VersionHistory />
          </div>
        }
      />

      {/* 11 — Cross-tool proof */}
      <FeatureBand
        testId="cross-tool-section"
        eyebrow={<OverlineEyebrow>Cross-tool proof</OverlineEyebrow>}
        heading="Watch your memory get used everywhere."
        body="Per-memory analytics show how often each one is read and through which channel — Web, CLI, AI assistants (MCP), and API. Proof your context is actually following you across tools, not stuck in one app."
        bullets={ANALYTICS_BULLETS}
        media={
          <div className="px-art">
            <UsageChart />
          </div>
        }
      />

      {/* 12 — Solo → Team */}
      <Section className="bg-muted" data-testid="solo-team-section" id="solo-team">
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
                  Your AI stops resetting to zero — every session picks up the
                  context and standards it already learned.
                </li>
                <li className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Add your team.
                  </span>{' '}
                  Memories live in a shared workspace — everyone’s AI reads and
                  contributes to the same growing memory, and new teammates
                  inherit the team’s hard-won context on day one.
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
              <div className="px-art">
                <SoloTeamIllustration />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 14 — FAQ */}
      <FAQSection
        heading="Questions, answered"
        subheading="Everything you need to know before you give your AI a memory that compounds."
        faqs={FAQS}
      />

      {/* 15 — Final CTA */}
      <CTASection
        heading="Give your AI a memory that grows with you."
        description="It writes down what it learns and reads it back before the next task — across every tool and your whole team. Free and open source — self-host it."
        primaryAction={{
          label: 'View on GitHub',
          onClick: () => handleViewOnGitHub('memory_final'),
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: () => handleSeeHowItWorks('memory_final'),
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
