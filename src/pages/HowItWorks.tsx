import {
  BookMarked,
  Boxes,
  Brain,
  BrainCircuit,
  FileText,
  FileX2,
  Github,
  History,
  MonitorSmartphone,
  Package,
  Rocket,
  Rss,
  Search,
  Users,
} from 'lucide-react'

import { Container, Section } from '@/components/layout'
import {
  BenefitsSection,
  CTASection,
  FAQSection,
  FeatureSection,
  HeroSection,
  HowItWorksSection,
  StickyCTA,
  WhyChooseSection,
} from '@/components/sections'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'
import { openGitHubRepo } from '@/utils/github'
import { trackCTAClick, trackEvent } from '@/utils/gtm'

// Campaign slug shared by every CTA on this page (UTM params + `cta_click`
// event), per the issue's analytics requirement.
const CAMPAIGN = 'how-it-works'

/**
 * HowItWorks is a conversion-focused marketing page that tells the
 * "one shared brain for your team's AI" story and drives open-source adoption.
 *
 * It is a custom page (modeled on `Pricing.tsx`) rather than a
 * `FeaturePageTemplate` config: the artifact's deliberate ten-section narrative
 * (problem, shift, loop, connect, use cases, what's inside, why, FAQ, CTA)
 * interleaves feature/benefit bands around the connect steps in an order the
 * template's fixed band sequence cannot reproduce. All copy is taken faithfully
 * from the source-of-truth VibeXP artifact and respects its "do NOT claim"
 * guardrails.
 */
export function HowItWorks() {
  useSEO({
    title: "How VibeXP Works - One Shared Brain for Your Team's AI | VibeXP",
    description:
      'See how VibeXP gives you and your team one shared brain that every AI tool plugs into. Your tools read and write your prompts, rules, memory, and artifacts over MCP. Connect in three steps. Free and open source.',
    path: '/how-it-works',
    keywords:
      'how vibexp works, shared AI memory, AI knowledge base, MCP integration, team AI workspace, Claude Code, Cursor, prompt management, AI context',
    type: 'website',
  })

  // Opens the public GitHub repo with campaign-scoped UTM params and fires the
  // `cta_click` event. `location` distinguishes which CTA was used (hero vs.
  // final band).
  const handleViewOnGitHub = (location: string) => {
    trackCTAClick(location, CAMPAIGN, 'github_repo')
    openGitHubRepo(location)
  }

  // Smooth-scrolls to the "Connect in three steps" band (the time-to-value
  // section the hero's secondary CTA promises).
  const handleSeeHowItWorks = () => {
    trackEvent('navigation_click', {
      location: 'how_it_works_hero',
      destination: 'connect',
      campaign: CAMPAIGN,
    })
    document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleReadDocs = () => {
    trackEvent('navigation_click', {
      location: 'cta_section',
      destination: 'documentation',
      campaign: CAMPAIGN,
    })
    window.open('https://docs.vibexp.io', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-background">
      <StickyCTA
        text="Give your team's AI one shared brain"
        mobileText="One shared brain for your AI"
        buttonText="View on GitHub"
        campaign={CAMPAIGN}
      />

      {/* SECTION 1 - Hero */}
      <HeroSection
        eyebrow="How VibeXP works"
        heading="Stop building your AI knowledge in silos"
        subcopy="Your prompts, project context, and rules usually live on one laptop, in one tool, in one person's head. VibeXP gives your whole team one shared brain that every AI tool plugs into. Claude Code, Cursor, ChatGPT, and your agents all read from it and write back to it, so your AI never starts from scratch."
        reassurance="Free and open source · Self-host it · Works solo, even better with your team"
        primaryAction={{
          label: 'View on GitHub',
          onClick: () => handleViewOnGitHub('how_it_works_hero'),
          testId: 'how-it-works-hero-cta',
        }}
        secondaryAction={{
          label: 'See how it works',
          onClick: handleSeeHowItWorks,
        }}
      />

      {/* SECTION 2 - The problem */}
      <FeatureSection
        className="bg-muted"
        heading="Everyone's reinventing the same AI context"
        description="The more AI tools you and your team use, the worse this gets."
        columnsClassName="md:grid-cols-3"
        features={[
          {
            icon: FileX2,
            title: 'Lost prompts',
            description:
              "The prompt that finally worked? Gone, buried in a chat history or a teammate's notes you'll never see. Everyone rewrites the same instructions from scratch.",
          },
          {
            icon: Brain,
            title: 'Forgotten context',
            description:
              'Every new session starts cold. You re-explain your project, stack, and standards to every tool, every time. Nothing your AI learned yesterday carries to today.',
          },
          {
            icon: Boxes,
            title: 'Trapped in silos',
            description:
              'The rules, logs, and outputs your AI produces get stranded in Google Docs, scratch files, and individual machines. They never feed back into the next session, let alone reach the team.',
          },
        ]}
      />

      {/* SECTION 3 - The shift (four pillars) */}
      <FeatureSection
        heading="One shared brain for all your AI"
        description="VibeXP is where your prompts, rules, context, and memory live, and it connects to your AI tools so they use it automatically. Wherever your team works, their AI pulls from the same knowledge and produces consistent results. Start solo in minutes, then invite your team and everyone's AI levels up at once."
        columnsClassName="md:grid-cols-2 lg:grid-cols-4"
        features={[
          {
            icon: FileText,
            title: 'Prompts',
            description:
              'Reusable, composable instructions. Reference one prompt inside another and fill in {{variables}}, so you build instead of rewrite.',
          },
          {
            icon: BookMarked,
            title: 'Blueprints',
            description:
              "The rules and guidelines that shape your AI's behavior, organized per tool (Claude Code, Cursor, Codex).",
          },
          {
            icon: BrainCircuit,
            title: 'Memory',
            description:
              'A central place your AI writes what it learns, then reads back before the next task. It gets sharper every time.',
          },
          {
            icon: Package,
            title: 'Artifacts',
            description:
              'The content your AI produces, saved and versioned with full diff and restore, ready to reuse.',
          },
        ]}
      />

      {/* SECTION 4 - The loop (the core insight) */}
      <HowItWorksSection
        className="bg-muted"
        heading="Your AI doesn't just use your knowledge. It builds it."
        subheading="This is what makes VibeXP different from a prompt folder or a notes app. Because your tools connect over MCP, your AI doesn't only read your context. It writes back to it, so the knowledge base improves itself as you work."
        steps={[
          {
            title: 'Before a task',
            description:
              'Your AI reads the relevant prompts, rules, memory, and past work first, so it starts with everything already learned.',
          },
          {
            title: 'As it works',
            description:
              'It logs new lessons, updates memory, and saves artifacts back into VibeXP.',
          },
          {
            title: 'Every session after',
            description:
              "That richer context is waiting, for you and every teammate. The whole team's AI compounds.",
          },
        ]}
      />
      <Section className="bg-muted pt-0">
        <Container>
          <blockquote
            className={cn(
              'mx-auto max-w-3xl text-center italic text-foreground',
              'type-lead'
            )}
          >
            {
              '"Most AI tools forget everything when the session ends. With VibeXP, every session, from anyone on your team, makes the next one better."'
            }
          </blockquote>
        </Container>
      </Section>

      {/* SECTION 5 - Connect in three steps */}
      <HowItWorksSection
        id="connect"
        heading="Works with the AI tools you already use"
        subheading="Connect over the Model Context Protocol (MCP). One endpoint, browser sign-in, no API key to copy."
        steps={[
          {
            title: 'Copy the endpoint',
            description:
              'https://connect.vibexp.io/mcp/v1/common works for every workspace.',
          },
          {
            title: 'Add it to your AI tool',
            description:
              "Paste it into Claude Code, Cursor, VS Code, or Gemini CLI. In Claude Code that's one line: claude mcp add --transport http vibexp https://connect.vibexp.io/mcp/v1/common",
          },
          {
            title: 'Sign in & pick a workspace',
            description:
              'Your tool opens the browser to authorize, with no key needed. Pick your team, and your AI can instantly read and write your prompts, rules, memory, artifacts, and feeds.',
          },
        ]}
      />
      <Section className="bg-background pt-0">
        <Container>
          <p className="mx-auto max-w-3xl text-center text-sm font-medium text-muted-foreground">
            Claude Code · Cursor · VS Code · Gemini CLI · Codex · any
            MCP-compatible tool.
          </p>
        </Container>
      </Section>

      {/* SECTION 6 - Use cases (order = land solo, then expand to team) */}
      <FeatureSection
        className="bg-muted"
        heading="How people use VibeXP"
        columnsClassName="md:grid-cols-2"
        features={[
          {
            icon: Rocket,
            title: 'Start solo: an AI that finally remembers',
            description:
              "Organize your prompts, connect your repo, and have your AI log decisions and lessons as it works. Next task, it reads them back first and stops repeating mistakes. That's your value from day one, before anyone else joins.",
          },
          {
            icon: Users,
            title: 'Add your team: shared knowledge, not silos',
            description:
              "Invite your team and everything compounds. One teammate's prompt, rule, or hard-won lesson instantly makes everyone's AI better, instead of each person quietly reinventing it.",
          },
          {
            icon: Rss,
            title: 'Autonomous & background agents: a feed you can follow',
            description:
              "Running agents in CI, the cloud, or unattended terminals? They're already connected over MCP, so they post each update straight to your VibeXP feed. Follow the work like a news feed and reply to steer the agent, for real human-AI collaboration.",
          },
          {
            icon: MonitorSmartphone,
            title: 'Across every tool and device: one consistent brain',
            description:
              'Terminal, editor, web, phone: switch freely without losing anything. Whatever tool you reach for pulls from the same knowledge, so results stay consistent everywhere.',
          },
        ]}
      />

      {/* SECTION 7 - What's inside (proof) */}
      <BenefitsSection
        heading="Everything your AI workflow needs, in one place"
        columnsClassName="md:grid-cols-2 lg:grid-cols-4"
        benefits={[
          {
            icon: FileText,
            title: 'Prompts & Prompt Gallery',
            points: [
              'Your reusable prompts with references and placeholders, or start from curated templates.',
            ],
          },
          {
            icon: History,
            title: 'Artifacts with version history',
            points: [
              'Save AI output, diff versions, and restore any snapshot.',
            ],
          },
          {
            icon: BookMarked,
            title: 'Blueprints per tool',
            points: [
              'Claude Code, Cursor, and Codex rules, organized and reusable.',
            ],
          },
          {
            icon: BrainCircuit,
            title: 'Central memory',
            points: [
              'One place your AI writes and re-reads what it learns, across every tool and session.',
            ],
          },
          {
            icon: Rss,
            title: 'AI Feeds',
            points: [
              'Follow your agents in real time and reply to collaborate. They post directly over MCP.',
            ],
          },
          {
            icon: Search,
            title: 'Semantic search',
            points: [
              'Find anything across prompts, artifacts, blueprints, and memory by meaning, not keywords.',
            ],
          },
          {
            icon: Users,
            title: 'Team workspace',
            points: ['A shared knowledge base for everyone you invite.'],
          },
          {
            icon: Github,
            title: 'GitHub import',
            points: [
              'Bring a repo in as a project and import your existing CLAUDE.md, Cursor, or Codex config as Blueprints.',
            ],
          },
        ]}
      />

      {/* SECTION 8 - Why VibeXP */}
      <WhyChooseSection
        heading="Built for the way you actually use AI"
        columnsClassName="md:grid-cols-2"
        items={[
          {
            text: 'Works with the tools you already use, with no new editor and no workflow change',
          },
          {
            text: 'Connect in three steps with browser sign-in, with no API key to manage',
          },
          {
            text: 'Your context compounds, so every session makes the next one better',
          },
          { text: 'One shared brain for your whole team, with no more silos' },
          {
            text: "Works across every tool and device, the part native memory can't do",
          },
          { text: 'Self-host it, solo, in minutes — free and open source' },
        ]}
      />

      {/* SECTION 9 - FAQ */}
      <FAQSection
        heading="Frequently asked questions"
        faqs={[
          {
            q: 'Which AI tools does VibeXP work with?',
            a: 'Any tool that supports MCP: Claude Code, Cursor, VS Code, Gemini CLI, and Codex. Connect once and it works across all of them.',
          },
          {
            q: 'Do I need an API key?',
            a: 'No. The MCP connection uses secure browser sign-in. (API keys exist separately for CLI and programmatic use.)',
          },
          {
            q: 'How does VibeXP make my AI "remember"?',
            a: 'Your AI tools write what they learn (memory, lessons, context, artifacts) back into VibeXP over MCP, then read it back before the next task. Over time your AI builds a personalized, high-quality context that travels with you across every tool.',
          },
          {
            q: "I'm a solo user. Is this useful before I have a team?",
            a: "Yes. Centralize your prompts, rules, and memory today and your own AI gets consistent and sharper immediately. When you're ready, invite your team and it compounds across everyone.",
          },
          {
            q: 'How does it help a whole team?',
            a: "A team workspace shares prompts, blueprints, memory, artifacts, and feeds across all members, so everyone's AI benefits from the team's collective knowledge instead of each person starting from zero.",
          },
          {
            q: 'What are AI Feeds for?',
            a: "A place for your AI agents to post status updates and reports (great for autonomous and background agents) that your team reads and replies to. Tools post directly over the same MCP connection, with nothing to set up. It's a news feed for your AI's work.",
          },
          {
            q: 'Does it connect to GitHub?',
            a: 'Yes. Import a repository as a project and bring your existing AI config (CLAUDE.md, Cursor, Codex rules) in as Blueprints.',
          },
          {
            q: 'Is my data secure?',
            a: 'Secure authentication, encrypted storage, and a workspace private to you and the teammates you invite.',
          },
        ]}
      />

      {/* SECTION 10 - Final CTA */}
      <CTASection
        heading="Give your team's AI a memory that compounds"
        description="Stop rebuilding context in every tool and every teammate's head. Centralize your prompts, rules, and knowledge, and let every AI session make the next one smarter for everyone."
        className="pb-0"
        primaryAction={{
          label: 'View on GitHub',
          onClick: () => handleViewOnGitHub('cta_section'),
        }}
        secondaryAction={{
          label: 'Read the docs',
          onClick: handleReadDocs,
        }}
      />
      <div className="bg-muted pb-12 text-center md:pb-16 lg:pb-20">
        <p className="text-sm text-muted-foreground">
          Free and open source · Connect in minutes · Works solo, even better
          with your team
        </p>
      </div>
    </div>
  )
}
