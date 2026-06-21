import {
  Activity,
  BookMarked,
  BrainCircuit,
  FileText,
  Package,
  Rss,
  Search,
  type LucideIcon,
} from 'lucide-react'
import { type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Container, Section } from '@/components/layout'
import { CTASection, HeroSection, StickyCTA } from '@/components/sections'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'
import { openGitHubRepo } from '@/utils/github'
import { trackCTAClick, trackEvent } from '@/utils/gtm'
import { getPageSEO } from '@/utils/seo'

// Campaign slug shared by every CTA on this page (UTM params + `cta_click`
// event), per the issue's analytics requirement. CTA surfaces are distinguished
// by `location` (features_hero / features_final / features_sticky), mirroring
// the site-wide "utm_medium = surface" convention used by the header and home.
const CAMPAIGN = 'features'

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

// The tools shown inside the dark MCP "Connect" band (no MCP logo here — the
// band itself is about MCP). Inverted to render white on the dark surface.
const CONNECT_TOOLS = TOOLS.filter(tool => tool.name !== 'MCP')

// The three MCP setup steps, mirrored from the homepage "Connect" section copy.
const CONNECT_STEPS = [
  {
    title: 'Copy the endpoint',
    description:
      'Grab the MCP endpoint. The same one works for every AI tool you connect.',
  },
  {
    title: 'Add it to your AI tool',
    description:
      'Paste it into Claude Code, Cursor, VS Code, or Gemini CLI with one command.',
  },
  {
    title: 'Sign in and pick a workspace',
    description:
      'Authorize in the browser. Your tools can now read and write your shared knowledge.',
  },
]

/**
 * The six building blocks shown as the hub card grid.
 *
 * `to` set → the card links to its live detail page (crawlable internal link).
 * `to` omitted → the detail page does not exist yet, so the card temporarily
 * deep-links to the homepage features section (hub-first sequencing decision,
 * issue #1894); it is swapped to `/features/<slug>` when that page ships.
 */
interface FeatureCardConfig {
  key: string
  icon: LucideIcon
  title: string
  description: string
  to?: string
}

const FEATURES: FeatureCardConfig[] = [
  {
    key: 'prompts',
    icon: FileText,
    title: 'Prompts',
    description:
      'Reusable, composable instructions. Reference other prompts and fill in variables, so you build instead of rewrite.',
    to: '/features/prompts',
  },
  {
    key: 'blueprints',
    icon: BookMarked,
    title: 'Blueprints',
    description:
      "The rules and guidelines that shape your AI's behavior, organized per tool: Claude Code, Cursor, Codex.",
    to: '/features/blueprints',
  },
  {
    key: 'memory',
    icon: BrainCircuit,
    title: 'Memory',
    description:
      'A central place your AI writes what it learns and reads back before the next task.',
    to: '/features/memory',
  },
  {
    key: 'artifacts',
    icon: Package,
    title: 'Artifacts',
    description:
      'Save AI-generated content with full version history. Diff and restore any version.',
    to: '/features/artifacts',
  },
  {
    key: 'ai-feeds',
    icon: Rss,
    title: 'AI Feeds',
    description:
      'Follow what your agents are doing in real time and reply to collaborate.',
  },
  {
    key: 'semantic-search',
    icon: Search,
    title: 'Semantic search',
    description:
      'Find anything across prompts, artifacts, blueprints, and memory by meaning, not keywords.',
  },
]

// The six hub nodes orbiting the VibeXP core, ordered to match the prototype:
// Prompts (top), Blueprints (upper-right), Memory (lower-right), Artifacts
// (bottom), AI Feeds (lower-left), Search (upper-left). Positions are percent
// offsets within the square illustration frame.
const HUB_NODES: {
  label: string
  icon: LucideIcon
  x: number
  y: number
}[] = [
  { label: 'Prompts', icon: FileText, x: 50, y: 6 },
  { label: 'Blueprints', icon: BookMarked, x: 90, y: 30 },
  { label: 'Memory', icon: BrainCircuit, x: 90, y: 70 },
  { label: 'Artifacts', icon: Package, x: 50, y: 94 },
  { label: 'AI Feeds', icon: Rss, x: 10, y: 70 },
  { label: 'Search', icon: Search, x: 10, y: 30 },
]

/**
 * FeatureHubIllustration is the hero's scatter→hub visual: six labelled feature
 * nodes connected by dashed lines to a central VibeXP core. Built from design-
 * system tokens (no color) so it stays on-brand and crisp at any size.
 */
function FeatureHubIllustration() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[34rem]"
      aria-hidden="true"
    >
      {/* Dashed connectors, drawn behind the nodes. */}
      <svg
        className="absolute inset-0 h-full w-full text-border"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {HUB_NODES.map(node => (
          <line
            key={node.label}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            stroke="currentColor"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
          />
        ))}
      </svg>

      {/* Central VibeXP core. */}
      <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <Activity className="h-7 w-7" aria-hidden="true" />
        <span className="text-xs font-semibold">VibeXP</span>
      </div>

      {/* Feature nodes. */}
      {HUB_NODES.map(node => {
        const Icon = node.icon
        return (
          <div
            key={node.label}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {node.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** A small uppercase eyebrow pill that reads on the dark connect band. */
function DarkEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-background/20 bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-background/80">
      {children}
    </span>
  )
}

/**
 * SoloTeamIllustration is the compact "solo → team" visual: a single VibeXP
 * core that fans out into a small cluster of teammate avatars.
 */
function SoloTeamIllustration() {
  return (
    <div
      className="flex items-center justify-center gap-8 rounded-xl border border-border bg-card p-8"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <Activity className="h-7 w-7" />
        </span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Solo
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 text-border">
        <span className="text-2xl leading-none">→</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex -space-x-2">
          {['A', 'B', 'C'].map(initial => (
            <span
              key={initial}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-card bg-secondary text-sm font-semibold text-secondary-foreground shadow-sm"
            >
              {initial}
            </span>
          ))}
        </div>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Team
        </span>
      </div>
    </div>
  )
}

export function Features() {
  const navigate = useNavigate()

  // SEO. Page-view tracking is handled once at the App level via
  // usePageTracking(); calling it here would double-count page_view.
  useSEO(getPageSEO('features'))

  // Opens the public GitHub repo with surface-scoped UTM params and fires the
  // `cta_click` event. `location` distinguishes which CTA was used.
  const handleViewOnGitHub = (location: string) => {
    trackCTAClick(location, CAMPAIGN, 'github_repo')
    openGitHubRepo(location)
  }

  // Smooth-scrolls to a section on this page (hero "Explore features" → grid).
  const scrollToSection = (targetId: string) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Navigates to the homepage and scrolls to its features section. Used by the
  // feature cards whose dedicated detail pages do not exist yet.
  const goToHomeFeatures = () => {
    navigate('/')
    setTimeout(() => {
      document
        .getElementById('features')
        ?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Fires `feature_card_click` (which feature) and, for cards without a live
  // detail page, performs the temporary homepage-section navigation.
  const handleFeatureCardClick = (feature: FeatureCardConfig) => {
    trackEvent('feature_card_click', {
      feature: feature.key,
      destination: feature.to ?? '/#features',
      location: 'features_grid',
    })
    if (!feature.to) {
      goToHomeFeatures()
    }
  }

  return (
    <div className="bg-background">
      <StickyCTA
        text="Free and open source · Self-host it"
        mobileText="Free and open source"
        buttonText="View on GitHub"
        location="features_sticky"
        campaign={CAMPAIGN}
      />

      {/* SECTION A — Hero */}
      <HeroSection
        eyebrow="Everything your AI relies on, in one place"
        heading="One knowledge base. Every AI tool."
        subcopy="Prompts, rules, memory, and artifacts in one shared place your tools read from and write back to. So every AI session starts smarter than the last."
        primaryAction={{
          label: 'View on GitHub',
          testId: 'features-hero-cta',
          onClick: () => handleViewOnGitHub('features_hero'),
        }}
        secondaryAction={{
          label: 'Explore features',
          onClick: () => scrollToSection('features-grid'),
        }}
        reassurance="Free and open source · Self-host it · Works with the tools you already use"
        media={<FeatureHubIllustration />}
      />

      {/* "Works with" logo strip */}
      <Section className="bg-background pt-0" data-testid="works-with-strip">
        <Container>
          <p className="text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
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

      {/* SECTION B — Feature card grid */}
      <Section id="features-grid" className="bg-muted">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="type-section">
              One place for everything your AI relies on
            </h2>
            <p className={cn('mt-4', 'type-lead')}>
              Six building blocks that turn scattered context into a knowledge
              base your tools share.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(feature => {
              const Icon = feature.icon
              const cardClassName =
                'group flex h-full flex-col rounded-xl border border-border bg-card p-6 text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              const inner = (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="type-card-title mt-4">{feature.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                    Learn more
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </>
              )

              return feature.to ? (
                <Link
                  key={feature.key}
                  to={feature.to}
                  data-testid={`feature-card-${feature.key}`}
                  className={cardClassName}
                  onClick={() => handleFeatureCardClick(feature)}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  key={feature.key}
                  type="button"
                  data-testid={`feature-card-${feature.key}`}
                  className={cardClassName}
                  onClick={() => handleFeatureCardClick(feature)}
                >
                  {inner}
                </button>
              )
            })}
          </div>
        </Container>
      </Section>

      {/* SECTION C — Connect band (MCP), dark */}
      <Section id="connect" className="bg-foreground text-background">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <DarkEyebrow>OAuth only, no API key</DarkEyebrow>
            <h2 className="type-section mt-4">
              Works with the tools you already use
            </h2>
            <p className="mt-4 type-lead !text-background/70">
              Connect over MCP in three steps. Browser sign-in, nothing to copy,
              paste, and babysit.
            </p>
          </div>

          <ol className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {CONNECT_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-background/10 bg-background/5 p-6"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-base font-bold text-foreground"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h3 className="type-card-title mt-4 text-background">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-background/70">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {CONNECT_TOOLS.map(tool => (
              <div key={tool.name} className="flex items-center gap-2.5">
                <img
                  src={tool.src}
                  alt={`${tool.name} logo`}
                  className="h-6 w-6 opacity-90 invert"
                  width={24}
                  height={24}
                  loading="lazy"
                />
                <span className="text-sm font-medium text-background/80">
                  {tool.name}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* SECTION D — Solo → Team band */}
      <Section className="bg-background" data-testid="solo-team-section">
        <Container>
          <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
            <SoloTeamIllustration />
            <div>
              <h2 className="type-section">
                Better on your own. Unstoppable with your team.
              </h2>
              <ul className="mt-6 space-y-4">
                <li className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Start solo.
                  </span>{' '}
                  Centralize your prompts, rules, and memory today. Every AI
                  session starts smarter than the last.
                </li>
                <li className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Expand to your team.
                  </span>{' '}
                  When you&apos;re ready it becomes a shared workspace, so one
                  person&apos;s prompt or rule benefits everyone.
                </li>
              </ul>
              <Link
                to="/how-it-works"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                See how it works
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* SECTION F — Final CTA */}
      <CTASection
        heading="Give your AI a knowledge base that grows with you"
        description="Stop rebuilding context from scratch. Centralize your prompts, rules, and knowledge, and let every AI session make the next one smarter."
        primaryAction={{
          label: 'View on GitHub',
          onClick: () => handleViewOnGitHub('features_final'),
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: () => navigate('/how-it-works'),
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
