import {
  BookMarked,
  BrainCircuit,
  Boxes,
  Check,
  Copy,
  FileText,
  Gauge,
  Maximize2,
  Package,
  RefreshCcw,
  Rocket,
  Rss,
  Search,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Container, Section } from '@/components/layout'
import {
  BenefitsSection,
  CTASection,
  FAQSection,
  FeatureSection,
  HeroSection,
  HowItWorksSection,
  ImageModal,
  ScreenshotCarousel,
  StickyCTA,
} from '@/components/sections'
import { Card, CardContent } from '@/components/ui/card'
import { useScrollTracking } from '@/hooks/useScrollTracking'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'
import { openGitHubRepo } from '@/utils/github'
import { trackCTAClick, trackEvent } from '@/utils/gtm'
import { getPageSEO } from '@/utils/seo'

// Campaign slug shared by every CTA on this page (UTM params + `cta_click`
// event), per the issue's analytics requirement.
const CAMPAIGN = 'homepage'

// The AI tools VibeXP plugs into, shown as a "works with" strip under the hero.
// Logos are monochrome currentColor SVGs; rendered via <img> they resolve to the
// foreground ink, matching the site's light design system.
const TOOLS = [
  { name: 'Claude Code', src: '/images/tools/claude-code.svg' },
  { name: 'Cursor', src: '/images/tools/cursor.svg' },
  { name: 'VS Code', src: '/images/tools/vscode.svg' },
  { name: 'Gemini CLI', src: '/images/tools/gemini.svg' },
  { name: 'ChatGPT', src: '/images/tools/chatgpt.svg' },
  { name: 'Codex', src: '/images/tools/codex.svg' },
  { name: 'MCP', src: '/images/tools/mcp.svg' },
]

// The three-step "loop" that makes VibeXP different: read, work, write back.
const LOOP_STEPS = [
  {
    title: 'Before a task',
    description:
      'Your AI reads the relevant prompts, rules, memory, and past work first, so it starts with everything already learned.',
  },
  {
    title: 'As it works',
    description:
      'It saves new lessons, updates memory, and stores outputs back into VibeXP.',
  },
  {
    title: 'Every session after',
    description:
      "That richer knowledge is waiting, for you and your teammates. The whole team's AI compounds.",
  },
]

// Curated, current product screenshots (issue #1850) used as proof. Showing the
// real product is stronger than vanity metrics for this audience.
const CAROUSEL_SCREENSHOTS = [
  {
    src: '/images/screenshots/dashboard-command-center.png',
    alt: 'VibeXP dashboard, the AI command center',
    title: 'Your AI command center',
    description:
      'Every prompt, rule, memory, artifact, and feed for your workspace in one place.',
    icon: Gauge,
  },
  {
    src: '/images/screenshots/artifact-version-diff.png',
    alt: 'Artifact version diff with line-level changes',
    title: 'Version history you can trust',
    description:
      'Diff any two versions of an artifact and restore the one you want in a click.',
    icon: Package,
  },
  {
    src: '/images/screenshots/ai-feed-with-replies.png',
    alt: 'AI feed with an agent post and a human reply',
    title: 'Follow your agents in real time',
    description:
      'Agents post their work to your feed over MCP, and you reply in-thread to steer them.',
    icon: Rss,
  },
  {
    src: '/images/screenshots/prompt-render.png',
    alt: 'A composable prompt with placeholders and metadata',
    title: 'Composable, reusable prompts',
    description:
      'Reference one prompt inside another and fill in variables, so you build instead of rewrite.',
    icon: FileText,
  },
  {
    src: '/images/screenshots/semantic-search.png',
    alt: 'Semantic search across prompts, artifacts, memory, and blueprints',
    title: 'Find anything by meaning',
    description:
      'Search across prompts, artifacts, blueprints, and memory by meaning, not keywords.',
    icon: Search,
  },
  {
    src: '/images/screenshots/team-workspace.png',
    alt: 'A team workspace with members and roles',
    title: 'A shared workspace for your team',
    description:
      "Invite your team and everyone's AI draws from the same knowledge base.",
    icon: Users,
  },
]

// A monospace command chip with a copy-to-clipboard button. Used for the MCP
// endpoint and the Claude Code one-liner, which are the highest-intent lines on
// the page for a developer audience and should read as copyable.
function CopyableCommand({
  label,
  command,
}: {
  label: string
  command: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard
      .writeText(command)
      .then(() => {
        trackEvent('copy_command', {
          command_label: label,
          location: 'mcp_connect',
          campaign: CAMPAIGN,
        })
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        // Clipboard can reject when the document lacks focus or permission;
        // fail silently rather than surfacing an unhandled rejection.
      })
  }

  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="mt-2 flex items-center gap-3 rounded-md border bg-background p-3">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-foreground">
          {command}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export function Home() {
  const navigate = useNavigate()
  const [modalImage, setModalImage] = useState<{
    src: string
    alt: string
  } | null>(null)

  // SEO. Page-view tracking is handled once at the App level via
  // usePageTracking(); calling it here would double-count page_view.
  useSEO(getPageSEO('home'))

  // Track scroll depth on homepage
  useScrollTracking()

  // Opens the public GitHub repo with surface-scoped UTM params and fires the
  // `cta_click` event. `location` distinguishes which CTA was used (hero vs.
  // final band).
  const handleViewOnGitHub = (location: string) => {
    trackCTAClick(location, CAMPAIGN, 'github_repo')
    openGitHubRepo(location)
  }

  // Records the click-through, then navigates to /how-it-works via the SPA
  // router (used by the hero and final-CTA secondary actions). Using
  // `navigate` instead of an anchor href keeps the client-side transition
  // consistent with the rest of the app and lets the deferred GTM event fire
  // before the page changes.
  const handleSeeHowItWorks = (location: string) => {
    trackEvent('navigation_click', {
      location,
      destination: 'how_it_works',
      campaign: CAMPAIGN,
    })
    navigate('/how-it-works')
  }

  // Opens the lightbox for a carousel screenshot and preserves the legacy
  // `image_zoom_click` analytics event. `image_name` is the src basename.
  const handleCarouselImageClick = (src: string, alt: string) => {
    const imageName = src.replace(/^.*\/|\.[^.]+$/g, '')
    trackEvent('image_zoom_click', {
      image_name: imageName,
      image_alt: alt,
      location: 'screenshot_carousel',
    })
    setModalImage({ src, alt })
  }

  return (
    <div className="bg-background">
      <StickyCTA
        text="Stop re-explaining everything to your AI"
        mobileText="One shared knowledge base for your AI"
        buttonText="View on GitHub"
        campaign={CAMPAIGN}
      />

      {/* SECTION 1 - Hero */}
      <HeroSection
        eyebrow="The shared knowledge base your AI builds on"
        heading="Stop re-explaining everything to your AI"
        subcopy="Your prompts, rules, and context in one place every AI tool can use. Claude Code, Cursor, ChatGPT, and more pull from what you've saved and add what they learn, so you never start from scratch again."
        primaryAction={{
          label: 'View on GitHub',
          testId: 'hero-cta-button',
          onClick: () => handleViewOnGitHub('hero'),
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: () => handleSeeHowItWorks('home_hero'),
        }}
        reassurance="Free and open source · Self-host it · Works with the tools you already use"
        media={
          <img
            src="/images/hero-knowledge-base.svg"
            alt="Your AI tools, Claude Code, Cursor, ChatGPT, Gemini, VS Code, and Codex, all connected to one shared VibeXP knowledge base"
            className="h-auto w-full"
            width={640}
            height={480}
          />
        }
      />

      {/* SECTION 2 - "Works with" logo strip */}
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

      {/* SECTION 3 - The problem */}
      <FeatureSection
        className="bg-muted"
        heading="Your AI starts from scratch every time"
        description="The more AI tools you use, the more you lose, and the more your team duplicates."
        columnsClassName="md:grid-cols-3"
        features={[
          {
            icon: RefreshCcw,
            title: 'You rewrite the same prompts',
            description:
              "That instruction that finally worked? Gone, buried in a chat history, or sitting in a teammate's notes you'll never see. Everyone reinvents the same prompts from scratch.",
          },
          {
            icon: BrainCircuit,
            title: 'You re-explain your context, constantly',
            description:
              'Every new session starts cold. You re-describe your project, your stack, and your standards to every tool, every time. Nothing your AI learned yesterday carries to today.',
          },
          {
            icon: Boxes,
            title: 'Your knowledge is trapped in silos',
            description:
              'The rules, learning logs, and outputs your AI produces get stranded in docs, scratch files, and individual laptops. They never feed back into the next session, let alone reach your team.',
          },
        ]}
      />

      {/* SECTION 4 - The differentiator: the loop */}
      <Section data-testid="loop-section">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="type-section">
              Your AI doesn&apos;t just use your knowledge. It builds it.
            </h2>
            <p className={cn('mt-4', 'type-lead')}>
              This is what makes VibeXP different from a prompt folder or your
              AI&apos;s built-in memory. Because your tools connect over MCP,
              your AI reads your saved knowledge and writes back to it. So your
              knowledge base improves itself as you work, for you and for
              everyone on your team.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-md">
            <img
              src="/images/loop-compounds.svg"
              alt="The VibeXP loop: your AI reads your knowledge, does the work, and writes back what it learns"
              className="h-auto w-full"
              width={480}
              height={420}
            />
          </div>

          <ol className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {LOOP_STEPS.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <h3 className="type-card-title mt-4">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>

          <blockquote
            className={cn(
              'mx-auto mt-12 max-w-3xl text-center italic text-foreground',
              'type-lead'
            )}
          >
            {
              '"Built-in AI memory is one tool, one person. VibeXP is every tool you use, and your whole team."'
            }
          </blockquote>
        </Container>
      </Section>

      {/* SECTION 5 - Connect in three steps */}
      <HowItWorksSection
        id="connect"
        className="bg-muted"
        heading="Set up in three steps, no API key"
        subheading="Connect over the Model Context Protocol (MCP). One endpoint, browser sign-in, nothing to copy-paste and babysit."
        steps={[
          {
            title: 'Copy the endpoint',
            description:
              'Grab the MCP endpoint below. The same one works for every workspace.',
          },
          {
            title: 'Add it to your AI tool',
            description:
              'Paste it into Claude Code, Cursor, VS Code, or Gemini CLI. In Claude Code it is the single command below.',
          },
          {
            title: 'Sign in & pick a workspace',
            description:
              'Your tool opens the browser to authorize, with no key needed. Your AI can instantly read and write your prompts, rules, memory, artifacts, and feeds.',
          },
        ]}
      />
      <Section className="bg-muted pt-0">
        <Container>
          <div className="mx-auto max-w-3xl space-y-4 rounded-lg border bg-background/60 p-6">
            <CopyableCommand
              label="MCP endpoint"
              command="https://connect.vibexp.io/mcp/v1/common"
            />
            <CopyableCommand
              label="Claude Code one-liner"
              command="claude mcp add --transport http vibexp https://connect.vibexp.io/mcp/v1/common"
            />
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <button
              type="button"
              onClick={() =>
                handleCarouselImageClick(
                  '/images/screenshots/mcp-connect.png',
                  'MCP connect: endpoint, the Claude Code one-liner, and client tabs'
                )
              }
              className="group relative block w-full overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Enlarge the MCP connect screenshot"
            >
              <img
                src="/images/screenshots/mcp-connect.png"
                alt="MCP connect: endpoint, the Claude Code one-liner, and client tabs"
                loading="lazy"
                className="h-auto w-full"
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-background/90 p-3 shadow-sm">
                  <Maximize2 className="h-6 w-6 text-foreground" />
                </span>
              </span>
            </button>
          </div>
        </Container>
      </Section>

      {/* SECTION 6 - What you get */}
      <BenefitsSection
        id="features"
        heading="One place for everything your AI relies on"
        columnsClassName="md:grid-cols-2 lg:grid-cols-3"
        benefits={[
          {
            icon: FileText,
            title: 'Prompts',
            points: [
              'Reusable, composable instructions. Reference other prompts and fill in variables, so you build instead of rewrite.',
            ],
          },
          {
            icon: BookMarked,
            title: 'Blueprints',
            points: [
              "The rules and guidelines that shape your AI's behavior, organized per tool (Claude Code, Cursor, Codex).",
            ],
          },
          {
            icon: BrainCircuit,
            title: 'Memory',
            points: [
              'A central place your AI writes what it learns and reads back before the next task.',
            ],
          },
          {
            icon: Package,
            title: 'Artifacts',
            points: [
              'Save AI-generated content with full version history. Diff and restore any version.',
            ],
          },
          {
            icon: Rss,
            title: 'AI Feeds',
            points: [
              'Follow what your agents are doing in real time and reply to collaborate.',
            ],
          },
          {
            icon: Search,
            title: 'Semantic search',
            points: [
              'Find anything across prompts, artifacts, blueprints, and memory by meaning, not keywords.',
            ],
          },
        ]}
      />

      {/* SECTION 7 - You + your team */}
      <Section className="bg-muted" data-testid="team-section">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="type-section">
              Better on your own. Unstoppable with your team.
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            <img
              src="/images/solo-vs-team.svg"
              alt="VibeXP works solo and compounds with your team's shared knowledge base"
              className="h-auto w-full"
              width={640}
              height={360}
            />
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <Rocket
                  className="mb-3 h-6 w-6 text-primary"
                  aria-hidden="true"
                />
                <h3 className="type-card-title">Start solo</h3>
                <p className="mt-2 text-muted-foreground">
                  Centralize your prompts, rules, and memory today. Your own AI
                  gets consistent and sharper from the first session, no team
                  required.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Users className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="type-card-title">Add your team</h3>
                <p className="mt-2 text-muted-foreground">
                  Invite your team and it compounds. One person&apos;s prompt,
                  rule, or hard-won lesson instantly makes everyone&apos;s AI
                  better, instead of each person quietly reinventing it.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* SECTION 8 - Proof: show the real product */}
      <Section className="bg-background">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="type-section">See VibeXP in action</h2>
            <p className={cn('mt-4', 'type-lead')}>
              Real screens from the product, not mockups.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Hover to pause. Click to view larger.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl">
            <ScreenshotCarousel
              screenshots={CAROUSEL_SCREENSHOTS}
              autoPlayInterval={4000}
              ariaLabel="VibeXP product screenshots"
              onImageClick={handleCarouselImageClick}
            />
          </div>
        </Container>
      </Section>

      {/* SECTION 9 - FAQ */}
      <FAQSection
        heading="Frequently asked questions"
        faqs={[
          {
            q: 'How is this different from the memory built into Claude or ChatGPT?',
            a: "Built-in memory lives inside one tool and one account. VibeXP is shared across every tool you use and everyone on your team, so your context follows you everywhere and your team's knowledge compounds, instead of being locked in one vendor.",
          },
          {
            q: 'Which AI tools does it work with?',
            a: 'Any tool that supports MCP: Claude Code, Cursor, VS Code, Gemini CLI, Codex, and more. Connect once and it works across all of them.',
          },
          {
            q: 'Do I need an API key?',
            a: 'No. The MCP connection uses secure browser sign-in. (API keys exist separately for CLI and programmatic use.)',
          },
          {
            q: "I'm solo. Is it useful before I have a team?",
            a: 'Yes. Centralize your prompts, rules, and memory today and your own AI gets consistent and sharper immediately. Invite your team whenever you are ready.',
          },
          {
            q: 'How does my AI actually "remember"?',
            a: 'Your tools write what they learn back into VibeXP over MCP, then read it before the next task, so your AI builds a personalized, growing knowledge base that travels with you across every tool.',
          },
          {
            q: 'Is my data secure?',
            a: 'Secure authentication, encrypted storage, and a workspace private to you and the teammates you invite.',
          },
        ]}
      />

      {/* SECTION 10 - Final CTA */}
      <CTASection
        heading="Give your AI a knowledge base that grows with you"
        description="Stop rebuilding context in every tool. Centralize your prompts, rules, and knowledge, and let every AI session make the next one smarter, for you and your team."
        primaryAction={{
          label: 'View on GitHub',
          onClick: () => handleViewOnGitHub('final_cta'),
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: () => handleSeeHowItWorks('home_final_cta'),
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

      <ImageModal
        open={modalImage !== null}
        onOpenChange={open => {
          if (!open) setModalImage(null)
        }}
        imageSrc={modalImage?.src ?? ''}
        imageAlt={modalImage?.alt ?? ''}
      />
    </div>
  )
}
