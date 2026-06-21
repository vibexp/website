import {
  Check,
  Copy,
  History,
  Lock,
  Shuffle,
  type LucideIcon,
} from 'lucide-react'
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

import './Prompts.illustrations.css'

// Campaign slug shared by every CTA on this page (UTM params + `cta_click`
// event), per the issue's analytics requirement. CTA surfaces are distinguished
// by `location` (prompts_hero / prompts_final / prompts_sticky), mirroring the
// site-wide "utm_medium = surface" convention used by the header and home.
const CAMPAIGN = 'prompts'

// The AI tools VibeXP plugs into, shown as a "works with" strip under the hero.
// Logos are monochrome currentColor SVGs rendered via <img>; on the light strip
// they resolve to the foreground ink, matching the site's design system.
const TOOLS = [
  { name: 'Claude Code', src: '/images/tools/claude-code.svg' },
  { name: 'Cursor', src: '/images/tools/cursor.svg' },
  { name: 'VS Code', src: '/images/tools/vscode.svg' },
  { name: 'Gemini CLI', src: '/images/tools/gemini.svg' },
  { name: 'ChatGPT', src: '/images/tools/chatgpt.svg' },
  { name: 'Codex', src: '/images/tools/codex.svg' },
  { name: 'MCP', src: '/images/tools/mcp.svg' },
]

// The three problem cards: where saved prompts go to die today.
const PROBLEM_CARDS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: History,
    title: 'You rewrite from memory',
    body: 'That prompt that finally worked last week? You’re retyping it now — slightly worse, a few minutes slower, every single time.',
  },
  {
    icon: Shuffle,
    title: 'Results are inconsistent',
    body: 'Different wording every time means different quality every time. There’s no standard to reach for, so output drifts.',
  },
  {
    icon: Lock,
    title: 'They’re trapped in chat history',
    body: 'Buried in a ChatGPT thread, a notes app, or a teammate’s head. A prompt you can’t find is a prompt you don’t have.',
  },
]

interface Bullet {
  title: string
  description: string
}

const COMPOSABLE_BULLETS: Bullet[] = [
  {
    title: 'DRY by design.',
    description:
      'Small, maintained blocks compose into big prompts — no copy-paste drift.',
  },
  {
    title: 'Dependency graph.',
    description:
      'A live “uses / used by” map — and anything others reference is protected from accidental deletion.',
  },
]

const RENDER_BULLETS: Bullet[] = [
  {
    title: 'No surprises.',
    description:
      'See exactly what your AI gets — references inlined, variables filled.',
  },
  {
    title: 'Raw ↔ Rendered.',
    description:
      'One toggle flips between the editable template and the resolved result.',
  },
]

const VERSION_BULLETS: Bullet[] = [
  {
    title: 'Treat prompts like code.',
    description: 'Author attribution and timestamps on every snapshot.',
  },
  {
    title: 'Diff & non-destructive restore.',
    description: 'Compare split or unified, roll back without losing newer work.',
  },
]

const ANALYTICS_BULLETS: Bullet[] = [
  {
    title: 'Four channels, one chart.',
    description: 'Web · CLI · MCP · API, broken out per prompt.',
  },
  {
    title: 'Signal, not vanity.',
    description: 'Find the prompts your whole workflow leans on.',
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
    description: 'Paste it into Claude Code, Cursor, VS Code, or Gemini CLI.',
  },
  {
    title: 'Sign in and pick a workspace.',
    description:
      'Authorize in the browser — your published prompts are now discoverable.',
  },
]

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do variables work?',
    a: 'Wrap any changeable part of a prompt in {{double braces}} to turn it into a fill-in-the-blanks template. When you use the prompt, you fill the values and VibeXP renders the final text — turning a 10-minute crafting job into a 30-second fill-in.',
  },
  {
    q: 'What are @-references / composable prompts?',
    a: 'Type @ inside a prompt to embed another prompt by reference. The referenced text is inlined when you render, so you maintain one building block and every prompt that uses it stays in sync. VibeXP tracks a live uses / used-by graph and protects referenced prompts from accidental deletion.',
  },
  {
    q: 'Which tools can use my prompts?',
    a: 'Any MCP-compatible AI tool — Claude Code, Cursor, VS Code, and Gemini — over a single connection. You can also reach your prompts from the CLI, the API, or copy any prompt anywhere.',
  },
  {
    q: 'Can I track and roll back changes?',
    a: 'Yes. VibeXP snapshots every change with the author and timestamp. Search the timeline, diff any two versions split or unified, and restore an earlier one without losing newer work.',
  },
  {
    q: 'Do I need an API key to connect my tools?',
    a: 'No. Connections use OAuth — you sign in through the browser and authorize a workspace. There is no API key to generate, copy, or rotate.',
  },
  {
    q: 'Can my team share prompts?',
    a: 'Yes. On a team, prompts live in a shared workspace that everyone can find, use, and improve, with every change attributed. New teammates ramp from day one.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. VibeXP is free and open source — self-host it and keep as many prompts as you need.',
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
  eyebrow: string
  heading: string
  body: string
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
 * composable, render, version-history, and analytics sections. The illustration
 * side alternates left/right via `reverse`, and the background alternates via
 * `muted`. Built so the remaining feature pages (e.g. Blueprints #1900) can
 * reuse the same shape.
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
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className={reverse ? 'lg:order-2' : undefined}>
            <OverlineEyebrow>{eyebrow}</OverlineEyebrow>
            <h2 className="type-section mt-4">{heading}</h2>
            <p className={cn('mt-4', 'type-lead')}>{body}</p>
            {bullets && <BulletList bullets={bullets} />}
          </div>
          <div className={cn('w-full', reverse && 'lg:order-1')}>{media}</div>
        </div>
      </Container>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Illustrations (8 + gallery) — ported verbatim from the approved #1898
   prototype (exact geometry/markup), styled by Prompts.illustrations.css
   under the .px-art scope. Monochrome, design-system tokens, light-only. */
/* ------------------------------------------------------------------ */

function HeroPromptGraph() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="hero-vis reveal"><div className="compose" aria-hidden="true"><svg className="compose-lines" viewBox="0 0 480 460" preserveAspectRatio="xMidYMid meet"><g fill="none" strokeLinecap="round"><path className="flow" d="M150 92 C 210 92, 200 200, 248 215"></path><path className="flow" d="M118 215 C 175 215, 195 218, 232 218"></path><path className="flow" d="M150 338 C 210 338, 200 240, 248 225"></path><path className="flow" d="M330 218 C 372 218, 372 218, 392 218"></path></g></svg><div className="cn" style={{left:'20%', top:'20%'}}><span className="cn-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg><span className="ref">{"@coding-standards"}</span></span></div><div className="cn" style={{left:'14%', top:'46.7%'}}><span className="cn-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg><span className="ref">{"@output-format"}</span></span></div><div className="cn" style={{left:'18%', top:'73.5%'}}><span className="cn-var">{"{{language}}"}</span></div><div className="cn cn-parent" style={{left:'50%', top:'47.5%'}}><div className="pt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>{"@code-review"}</div><div className="ln tok" style={{width:'90%'}}></div><div className="ln" style={{width:'70%'}}></div><div className="ln" style={{width:'82%'}}></div><div className="ln tok" style={{width:'55%'}}></div></div><div className="cn cn-out" style={{left:'84%', top:'47.5%'}}><div className="ot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>{"Rendered"}</div><div className="ln fill" style={{width:'100%'}}></div><div className="ln" style={{width:'85%'}}></div><div className="ln fill" style={{width:'92%'}}></div><div className="ln" style={{width:'74%'}}></div><div className="ln" style={{width:'88%'}}></div></div><div className="cn-cap">{"One prompt, built from reusable blocks → fully resolved output"}</div></div></div>
    </div>
  )
}

function LibraryFanIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="solu-vis reveal"><div className="solu-hub" aria-hidden="true"><svg className="compose-lines" viewBox="0 0 420 356" preserveAspectRatio="xMidYMid meet"><g fill="none" strokeLinecap="round"><path className="flow" d="M138 178 C 230 178, 250 64, 318 64"></path><path className="flow" d="M138 178 C 240 178, 260 134, 318 134"></path><path className="flow" d="M138 178 C 240 178, 260 222, 318 222"></path><path className="flow" d="M138 178 C 230 178, 250 292, 318 292"></path></g></svg><div className="lib-core"><div className="lc-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>{"Library"}</div><div className="lc-row a"></div><div className="lc-row"></div><div className="lc-row a"></div><div className="lc-row"></div></div><div className="tool-node" style={{left:'76%', top:'18%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"></path></svg><small>{"Claude Code"}</small></div><div className="tool-node" style={{left:'76%', top:'37.6%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"><path d="m21 8-9-5-9 5v8l9 5 9-5Z"></path><path d="m3 8 9 5 9-5M12 13v8"></path></svg><small>{"Cursor"}</small></div><div className="tool-node" style={{left:'76%', top:'62.4%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"></path></svg><small>{"VS Code"}</small></div><div className="tool-node" style={{left:'76%', top:'82%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="3.5"></circle></svg><small>{"ChatGPT"}</small></div></div></div>
    </div>
  )
}

function DependencyGraphIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="fband-vis reveal"><div className="dia"><div className="dep" aria-hidden="true"><svg className="dep-lines" viewBox="0 0 460 376" preserveAspectRatio="xMidYMid meet"><g fill="none" strokeLinecap="round"><path className="flow" d="M150 188 C 240 188, 250 78, 322 78"></path><path className="flow" d="M150 188 C 240 188, 250 298, 322 298"></path><path className="flow" d="M88 96 C 88 150, 110 170, 130 182" style={{opacity:'.22'}}></path><path className="flow" d="M88 286 C 88 226, 110 206, 130 194" style={{opacity:'.22'}}></path></g></svg><div className="dnode" style={{left:'18%', top:'25.5%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>{"@output-format"}</div><div className="dnode" style={{left:'18%', top:'76%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>{"@severity-rubric"}</div><div className="dnode hub" style={{left:'31%', top:'50%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>{"@coding-standards"}<span className="badge">{"used by 2"}</span></div><div className="dep-tag" style={{left:'62.5%', top:'32%'}}>{"uses"}</div><div className="dep-tag" style={{left:'62.5%', top:'68%'}}>{"uses"}</div><div className="dnode" style={{left:'84%', top:'20.7%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>{"@code-review"}</div><div className="dnode" style={{left:'83%', top:'79.3%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>{"@pr-description"}</div></div></div></div>
    </div>
  )
}

function RenderSplitIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="fband-vis reveal"><div className="dia"><div className="rr-toggle" role="tablist" aria-label="Raw or rendered"><button type="button" tabIndex={-1} role="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>{"Raw"}</button><button type="button" tabIndex={-1} role="tab" aria-selected="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>{"Rendered"}</button></div><div className="rr-panes"><div className="rr-pane" data-pane="raw"><div className="ph"><span>{"Template"}</span><span>{"raw"}</span></div><div className="rr-code">{"Review this "}<span className="tok-var">{"{{language}}"}</span>{" diff.\n\nApply "}<span className="tok-ref">{"@coding-standards"}</span>{"\nand report using "}<span className="tok-ref">{"@output-format"}</span>{".\n\nScope: "}<span className="tok-var">{"{{scope}}"}</span></div><div className="rr-fields"><div className="fld"><label>{"language"}</label><div className="v">{"Go"}</div></div><div className="fld"><label>{"scope"}</label><div className="v">{"auth/ package"}</div></div></div></div><div className="rr-pane" data-pane="rendered"><div className="ph"><span>{"Sent to your AI"}</span><span className="live"><span className="d"></span>{"Rendered"}</span></div><div className="rr-code">{"Review this "}<span className="tok-fill">{"Go"}</span>{" diff.\n\n"}<span className="tok-fill">{"Follow naming, error-wrapping\nand layering conventions."}</span>{"\nReport as: "}<span className="tok-fill">{"severity · file:line · fix."}</span>{"\n\nScope: "}<span className="tok-fill">{"auth/ package"}</span></div><div className="rr-fields"><div className="fld"><label>{"references"}</label><div className="v">{"2 inlined"}</div></div><div className="fld"><label>{"variables"}</label><div className="v">{"2 filled"}</div></div></div></div></div></div></div>
    </div>
  )
}

function VersionHistoryIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="fband-vis reveal"><div className="dia"><div className="vh-grid"><ul className="timeline" aria-hidden="true"><li className="cur"><span className="dot"></span><div className="vrow"><span className="vtag">{"v6"}</span><span className="pill">{"Current"}</span></div><div className="meta"><b>{"You"}</b>{" · 3s ago"}</div><span className="restore"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path></svg>{"Viewing"}</span></li><li><span className="dot"></span><div className="vrow"><span className="vtag">{"v5"}</span></div><div className="meta"><b>{"M. Rahman"}</b>{" · 2d ago"}</div><span className="restore"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>{"Restore"}</span></li><li><span className="dot"></span><div className="vrow"><span className="vtag">{"v4"}</span></div><div className="meta"><b>{"You"}</b>{" · 5d ago"}</div></li></ul><div className="diff" aria-hidden="true"><div className="dh"><span>{"v5 → v6"}</span><span className="seg"><span>{"Split"}</span><span className="on">{"Unified"}</span></span></div><div className="dbody"><div className="dl del"><span className="gut">{"-"}</span><span>{"Report issues found."}</span></div><div className="dl add"><span className="gut">{"+"}</span><span>{"Report as: severity · file:line · fix."}</span></div><div className="dl"><span className="gut"></span><span>{"Apply @coding-standards."}</span></div><div className="dl add"><span className="gut">{"+"}</span><span>{"Use @output-format for results."}</span></div><div className="dl"><span className="gut"></span><span>{"Scope: {{scope}}"}</span></div></div></div></div></div></div>
    </div>
  )
}

function McpHubIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="mcp-hub-wrap reveal"><div className="mcp-hub" aria-hidden="true"><svg className="mcp-hub-lines" viewBox="0 0 380 380" preserveAspectRatio="xMidYMid meet"><g fill="none" strokeLinecap="round"><path className="flow" d="M190 190 L190 64"></path><path className="flow" d="M190 190 L300 127"></path><path className="flow" d="M190 190 L300 253"></path><path className="flow" d="M190 190 L190 316"></path><path className="flow" d="M190 190 L80 253"></path><path className="flow" d="M190 190 L80 127"></path></g></svg><div className="mcp-core"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 13h4"></path><path d="M10 17h4"></path></svg><span>{"Prompt"}</span></div><div className="mcp-node" style={{left:'50%', top:'16%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"></path></svg><small>{"Claude Code"}</small></div><div className="mcp-node" style={{left:'79%', top:'33%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"><path d="m21 8-9-5-9 5v8l9 5 9-5Z"></path><path d="m3 8 9 5 9-5M12 13v8"></path></svg><small>{"Cursor"}</small></div><div className="mcp-node" style={{left:'79%', top:'67%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"></path></svg><small>{"VS Code"}</small></div><div className="mcp-node" style={{left:'50%', top:'84%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"><path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2Z"></path></svg><small>{"Gemini"}</small></div><div className="mcp-node" style={{left:'21%', top:'67%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="m7 8-4 4 4 4M13 16h4"></path></svg><small>{"CLI"}</small></div><div className="mcp-node" style={{left:'21%', top:'33%'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"></path><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"></path></svg><small>{"API"}</small></div></div></div>
    </div>
  )
}

function AnalyticsChartIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="fband-vis reveal"><div className="dia"><div className="usage" aria-hidden="true"><div className="chart"><div className="bar-col"><span className="bv">{"42"}</span><div className="bar" style={{height:'88%'}}><div className="seg s1" style={{height:'55%'}}></div><div className="seg s2" style={{height:'20%'}}></div><div className="seg s3" style={{height:'18%'}}></div><div className="seg s4" style={{height:'7%'}}></div></div><span className="bl">{"code-review"}</span></div><div className="bar-col"><span className="bv">{"31"}</span><div className="bar" style={{height:'66%'}}><div className="seg s1" style={{height:'38%'}}></div><div className="seg s2" style={{height:'14%'}}></div><div className="seg s3" style={{height:'40%'}}></div><div className="seg s4" style={{height:'8%'}}></div></div><span className="bl">{"pr-description"}</span></div><div className="bar-col"><span className="bv">{"24"}</span><div className="bar" style={{height:'50%'}}><div className="seg s1" style={{height:'62%'}}></div><div className="seg s2" style={{height:'10%'}}></div><div className="seg s3" style={{height:'20%'}}></div><div className="seg s4" style={{height:'8%'}}></div></div><span className="bl">{"security-audit"}</span></div><div className="bar-col"><span className="bv">{"18"}</span><div className="bar" style={{height:'38%'}}><div className="seg s1" style={{height:'30%'}}></div><div className="seg s2" style={{height:'22%'}}></div><div className="seg s3" style={{height:'30%'}}></div><div className="seg s4" style={{height:'18%'}}></div></div><span className="bl">{"release-notes"}</span></div><div className="bar-col"><span className="bv">{"11"}</span><div className="bar" style={{height:'24%'}}><div className="seg s1" style={{height:'48%'}}></div><div className="seg s2" style={{height:'30%'}}></div><div className="seg s3" style={{height:'12%'}}></div><div className="seg s4" style={{height:'10%'}}></div></div><span className="bl">{"changelog"}</span></div></div><div className="legend"><span className="lg"><span className="sw s1"></span>{"Web"}</span><span className="lg"><span className="sw s2"></span>{"CLI"}</span><span className="lg"><span className="sw s3"></span>{"MCP"}</span><span className="lg"><span className="sw s4"></span>{"API"}</span></div></div></div></div>
    </div>
  )
}

function SoloTeamIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="team-vis reveal" aria-hidden="true"><div className="cluster"><div className="node-core"><svg viewBox="0 0 512 512" fill="none"><path d="M128 256h48l32-96 64 192 32-96h48" stroke="currentColor" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></svg></div><span className="cluster-label">{"Solo"}</span></div><span className="arrow-between"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span><div className="cluster"><div className="team-mesh"><div className="node-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg></div><div className="node-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg></div><div className="node-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg></div><div className="node-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg></div><div className="node-core"><svg viewBox="0 0 512 512" fill="none"><path d="M128 256h48l32-96 64 192 32-96h48" stroke="currentColor" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></svg></div><div className="node-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg></div><div className="node-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg></div><div className="node-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg></div><div className="node-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 20a8 8 0 0 1 16 0"></path></svg></div></div><span className="cluster-label">{"Team"}</span></div></div>
    </div>
  )
}

function GalleryIllustration() {
  return (
    <div className="px-art" aria-hidden="true">
      <div className="gallery"><div className="gcard reveal"><div className="gcard-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg></div><h4>{"Engineering"}</h4><ul><li>{"code-review"}</li><li>{"security-audit"}</li><li>{"test-writer"}</li></ul><span className="use">{"Use this prompt"}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span></div><div className="gcard reveal"><div className="gcard-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg></div><h4>{"Product Management"}</h4><ul><li>{"prd-draft"}</li><li>{"user-story"}</li><li>{"roadmap-note"}</li></ul><span className="use">{"Use this prompt"}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span></div><div className="gcard reveal"><div className="gcard-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg></div><h4>{"Marketing"}</h4><ul><li>{"blog-outline"}</li><li>{"email-copy"}</li><li>{"seo-brief"}</li></ul><span className="use">{"Use this prompt"}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span></div><div className="gcard reveal"><div className="gcard-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14a9 3 0 0 0 18 0V5"></path><path d="M3 12a9 3 0 0 0 18 0"></path></svg></div><h4>{"Data Analysis"}</h4><ul><li>{"sql-explain"}</li><li>{"chart-spec"}</li><li>{"insight-summary"}</li></ul><span className="use">{"Use this prompt"}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span></div><div className="gcard reveal"><div className="gcard-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg></div><h4>{"Customer Support"}</h4><ul><li>{"reply-draft"}</li><li>{"tone-rewrite"}</li><li>{"escalation"}</li></ul><span className="use">{"Use this prompt"}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></span></div></div>
      <div className="organize"><div className="org reveal"><span className="oic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><rect width="7" height="7" x="8.5" y="8.5" rx="1"></rect></svg></span><div><b>{"Projects"}</b><span>{"Group prompts by project to keep big libraries tidy."}</span></div></div><div className="org reveal"><span className="oic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg></span><div><b>{"Labels"}</b><span>{"Tag with up to 10 labels for fast filtering."}</span></div></div><div className="org reveal"><span className="oic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></span><div><b>{"Filter & sort"}</b><span>{"By status, shared, and more — find prompts in a click."}</span></div></div><div className="org reveal"><span className="oic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 14.5 21 3"></path><path d="M14 2l1.5 4L20 8l-4.5 2L14 14l-1.5-4L8 8l4.5-2z" transform="scale(.7) translate(2 2)"></path><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></span><div><b>{"Semantic search"}</b><span>{"Find prompts by meaning, not just keywords."}</span></div></div></div>
    </div>
  )
}

/** Copyable MCP endpoint with an accessible copied state (dark band). */
function CopyEndpoint() {
  const [copied, setCopied] = useState(false)
  const endpoint = 'https://connect.vibexp.io/mcp/v1/common'

  const handleCopy = () => {
    void navigator.clipboard?.writeText(endpoint)
    trackEvent('copy_mcp_endpoint', { location: 'prompts_mcp' })
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-background/15 bg-background/5 p-3 sm:flex-row sm:items-center">
      <span className="rounded bg-background/10 px-2 py-1 type-code text-background/70">
        MCP
      </span>
      <code className="flex-1 break-all type-code text-background">
        {endpoint}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy MCP endpoint ${endpoint}`}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
      >
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

export function Prompts() {
  const navigate = useNavigate()

  // SEO. Page-view tracking is handled once at the App level via
  // usePageTracking(); calling it here would double-count page_view.
  useSEO(getPageSEO('promptManagement'))

  // Opens the public GitHub repo in a new tab and fires the `cta_click`
  // event. `location` distinguishes which CTA was used (hero / final / sticky).
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
        text="Build your reusable prompt library · 100 prompts free"
        mobileText="Build your prompt library · Open source"
        buttonText="View on GitHub"
        location="prompts_sticky"
        campaign={CAMPAIGN}
      />

      {/* 1 — Hero */}
      <HeroSection
        eyebrow="Prompts · your reusable library"
        heading="Stop rewriting the same prompts."
        subcopy="Save your best prompts once as reusable, composable templates — fill in variables, reference other prompts, and reach them from every AI tool you use. Build instead of rewrite."
        primaryAction={{
          label: 'View on GitHub',
          testId: 'prompts-hero-cta',
          onClick: () => handleViewOnGitHub('prompts_hero'),
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: () => handleSeeHowItWorks('prompts_hero'),
        }}
        reassurance="Free and open source · Self-host it · Works with the tools you already use"
        media={<HeroPromptGraph />}
      />

      {/* 2 — Works-with strip */}
      <Section className="bg-background pt-0" data-testid="works-with-strip">
        <Container>
          <p className="text-center type-overline text-muted-foreground">
            Plugs into the tools you already use
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {TOOLS.map(tool => (
              <div key={tool.name} className="flex items-center gap-2.5">
                <img
                  src={tool.src}
                  alt={`${tool.name} logo`}
                  className="h-7 w-7 opacity-80"
                  width={28}
                  height={28}
                  loading="lazy"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {tool.name}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3 — Problem */}
      <Section className="bg-muted" data-testid="problem-section">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="type-section">
              Your best prompts keep disappearing.
            </h2>
            <p className={cn('mt-4', 'type-lead')}>
              The prompt that finally worked is never where you need it next
              time.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PROBLEM_CARDS.map(card => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="flex h-full flex-col rounded-xl border border-border bg-card p-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="type-card-title mt-4">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {card.body}
                  </p>
                </div>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* 4 — Solution / What is Prompts */}
      <Section className="bg-background" data-testid="solution-section">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <PillEyebrow>What is Prompts</PillEyebrow>
              <h2 className="type-section mt-4">
                One library. Every prompt. Reusable.
              </h2>
              <p className={cn('mt-4', 'type-lead')}>
                Save a prompt once and it becomes a template you can customize
                and deploy in seconds — across any AI tool, on your own or with
                your team. Stop reaching for chat history. Start reaching for
                your library.
              </p>
            </div>
            <div className="w-full">
              <LibraryFanIllustration />
            </div>
          </div>
        </Container>
      </Section>

      {/* 5 — Composable building blocks */}
      <FeatureBand
        muted
        testId="composable-section"
        eyebrow="Composable building blocks"
        heading="Build prompts from prompts."
        body="Reference any prompt inside another with @, and drop in {{variables}} for the parts that change. Update a building block once and every prompt that uses it stays in sync."
        bullets={COMPOSABLE_BULLETS}
        media={<DependencyGraphIllustration />}
      />

      {/* 6 — Render & live preview (media left) */}
      <FeatureBand
        reverse
        testId="render-section"
        eyebrow="Render & live preview"
        heading="Preview the final prompt before you send it."
        body="Fill in the variables — including ones inherited from referenced prompts — and see the fully resolved text your AI will actually receive. Toggle between your template and the rendered output."
        bullets={RENDER_BULLETS}
        media={<RenderSplitIllustration />}
      />

      {/* 7 — Version history */}
      <FeatureBand
        muted
        testId="version-history-section"
        eyebrow="Version history"
        heading="Every change, tracked. Every version, recoverable."
        body="Prompts evolve. VibeXP snapshots every change with who edited it and when — search the timeline, diff any two versions side by side, and restore an earlier one safely."
        bullets={VERSION_BULLETS}
        media={<VersionHistoryIllustration />}
      />

      {/* 8 — Use it anywhere (dark MCP band) */}
      <Section
        className="bg-foreground text-background"
        data-testid="mcp-section"
      >
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-background/20 bg-background/10 px-3 py-1 type-overline text-background/80">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-background"
                  aria-hidden="true"
                />
                OAuth only · no API key
              </span>
              <h2 className="type-section mt-4">
                Write a prompt once. Use it in every AI tool.
              </h2>
              <p className="mt-4 type-lead !text-background/70">
                Publish a prompt and it shows up inside the tools you already use
                — Claude Code, Cursor, VS Code, Gemini — over one MCP connection.
                Or reach it from the CLI, the API, or copy it anywhere.
              </p>
              <div className="mt-6">
                <CopyEndpoint />
              </div>
              <ol className="mt-6 space-y-4">
                {MCP_STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-sm font-bold text-foreground"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm text-background/70">
                      <span className="font-semibold text-background">
                        {step.title}
                      </span>{' '}
                      {step.description}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="w-full">
              <McpHubIllustration />
            </div>
          </div>
        </Container>
      </Section>

      {/* 9 — Per-prompt analytics (media left) */}
      <FeatureBand
        reverse
        testId="analytics-section"
        eyebrow="Per-prompt analytics"
        heading="See which prompts actually earn their keep."
        body="Per-prompt usage shows how often each one is used and where — Web, CLI, AI assistants (MCP), and API — so you double down on what works and retire what doesn’t."
        bullets={ANALYTICS_BULLETS}
        media={<AnalyticsChartIllustration />}
      />

      {/* 10 — Gallery + organization */}
      <Section className="bg-muted" data-testid="gallery-section">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="type-section">Never start from a blank page.</h2>
            <p className={cn('mt-4', 'type-lead')}>
              Browse the Prompt Gallery — curated, ready-to-use templates by
              category. Adopt one in a click, or duplicate any of your own as a
              starting point.
            </p>
          </div>

          <div className="mt-12">
            <GalleryIllustration />
          </div>
        </Container>
      </Section>

      {/* 11 — Solo → Team */}
      <Section className="bg-background" data-testid="solo-team-section">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="type-section">
                Better on your own. Unstoppable with your team.
              </h2>
              <ul className="mt-6 space-y-4">
                <li className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Start solo.
                  </span>{' '}
                  Build your reusable prompt library today — every session starts
                  from your best work, not a blank box.
                </li>
                <li className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Expand to your team.
                  </span>{' '}
                  Prompts live in a shared workspace — everyone finds, uses, and
                  improves the same library, with every change attributed. New
                  teammates ramp on day one.
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
            <div className="w-full">
              <SoloTeamIllustration />
            </div>
          </div>
        </Container>
      </Section>

      {/* 13 — FAQ */}
      <FAQSection
        heading="Questions, answered"
        subheading="Everything you need to know before you start building your library."
        faqs={FAQS}
      />

      {/* 14 — Final CTA */}
      <CTASection
        heading="Build a prompt library you’ll actually reuse."
        description="Save your best prompts once, compose them into bigger ones, and reach them from every AI tool you use. Free and open source — self-host it."
        primaryAction={{
          label: 'View on GitHub',
          onClick: () => handleViewOnGitHub('prompts_final'),
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: () => handleSeeHowItWorks('prompts_final'),
        }}
      />
      <div className="bg-muted pb-12 text-center md:pb-16 lg:pb-20">
        <Container>
          <p className="mx-auto max-w-md text-xs text-muted-foreground sm:text-sm">
            Free and open source · Self-host it · Works with the tools you
            already use
          </p>
        </Container>
      </div>
    </div>
  )
}
