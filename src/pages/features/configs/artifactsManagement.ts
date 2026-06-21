import {
  Bot,
  FileCode2,
  FolderTree,
  GitBranch,
  Link2,
  Lock,
  Package,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react'

import type { FeaturePageConfig } from '../types'

export const artifactsManagementConfig: FeaturePageConfig = {
  seoKey: 'artifactsManagement',
  stickyCta: {
    text: 'Never Lose AI-Generated Content',
    mobileText: 'View on GitHub',
    buttonText: 'View on GitHub',
    campaign: 'artifacts_management',
  },
  hero: {
    eyebrow: 'Organize Your AI-Generated Content',
    heading: 'Artifacts Management',
    subcopy:
      'Transform your AI conversations into a searchable knowledge base. Capture, organize, and retrieve code snippets, documentation, and reports with powerful search and categorization.',
  },
  stats: {
    columnsClassName: 'md:grid-cols-3',
    stats: [
      { value: 'Unlimited', label: 'Artifacts', icon: Package },
      { value: 'Instant', label: 'Search & Find', icon: Zap },
      { value: 'Smart', label: 'Organization', icon: FolderTree },
    ],
  },
  whatIs: {
    heading: 'What is Artifacts Management?',
    description: [
      'A powerful content organization system that captures, stores, and manages substantial AI-generated content from your conversations.',
      'Your AI content library—a centralized repository where code, documentation, reports, and valuable outputs are preserved, categorized, and searchable.',
    ],
    columnsClassName: 'md:grid-cols-2 lg:grid-cols-4',
    features: [
      {
        icon: Package,
        title: 'Auto Capture',
        description: 'Automatically preserve content',
      },
      {
        icon: FolderTree,
        title: 'Smart Categories',
        description: 'Work reports, code, docs',
      },
      {
        icon: Search,
        title: 'Powerful Search',
        description: 'Find anything instantly',
      },
      {
        icon: Link2,
        title: 'MCP Integration',
        description: 'AI tools access directly',
      },
    ],
  },
  screenshots: {
    heading: 'See Artifacts Management in Action',
    subheading: 'Capture, organize, and search your AI-generated content',
    hint: 'Click to view larger',
    ariaLabel: 'Artifacts Management screenshots',
    screenshots: [
      {
        src: '/images/screenshots/artifacts_management_homepage.png',
        alt: 'Artifacts Management Dashboard',
        title: 'Artifacts Dashboard',
        description:
          'Manage and organize all your AI-generated content with powerful search and categorization',
        icon: Package,
      },
    ],
  },
  benefits: {
    heading: 'How It Boosts Your Productivity',
    subheading: 'Transform scattered AI outputs into organized knowledge',
    columnsClassName: 'md:grid-cols-3',
    benefits: [
      {
        icon: Lock,
        title: 'Never Lose Content',
        points: [
          'Auto-capture substantial AI-generated outputs',
          'Preserve code, docs, and reports forever',
          'Build a growing knowledge base over time',
        ],
        popular: false,
      },
      {
        icon: Search,
        title: 'Find Anything Instantly',
        points: [
          'Powerful full-text search across all content',
          'Filter by project, type, status, metadata',
          'Tag and categorize for quick discovery',
        ],
        popular: true,
      },
      {
        icon: Link2,
        title: 'Seamless AI Integration',
        points: [
          'AI tools create artifacts automatically',
          'Access via MCP in Claude, Cursor, VS Code',
          'Reference previous work in new conversations',
        ],
        popular: false,
      },
    ],
  },
  howItWorks: {
    heading: 'How Artifacts Management Works',
    subheading: 'Five simple steps to organized content',
    steps: [
      {
        title: 'Capture AI-Generated Content',
        description:
          'Automatically save substantial content from AI conversations as artifacts. Each gets unique identification, rich metadata, content classification, and status tracking.',
      },
      {
        title: 'Organize by Projects',
        description:
          'Group related artifacts into project-specific collections. Create logical structures with cross-project search capabilities and unique slug identification.',
      },
      {
        title: 'Search & Filter Instantly',
        description:
          'Find any artifact with powerful full-text search. Filter by project, type (work reports, code, docs), status, creation date, and custom metadata fields.',
      },
      {
        title: 'Access from AI Tools',
        description:
          'Use artifacts through MCP integration in Claude, Cursor, and VS Code. AI tools can create, search, retrieve, and update artifacts automatically.',
      },
      {
        title: 'Manage & Preview',
        description:
          'View statistics, perform bulk operations, preview content with markdown rendering and beautiful syntax highlighting for all your saved artifacts.',
      },
    ],
  },
  whyChoose: {
    heading: 'Why Choose VibeXP for Artifacts Management?',
    subheading: 'Everything you need to organize AI-generated content',
    columnsClassName: 'md:grid-cols-2',
    items: [
      {
        icon: Package,
        text: 'Unlimited Artifacts - Store as much content as you need',
      },
      {
        icon: Bot,
        text: 'Auto Capture - Automatically preserve AI outputs',
      },
      {
        icon: FolderTree,
        text: 'Smart Categories - Work reports, code, docs, and more',
      },
      {
        icon: Search,
        text: 'Powerful Search - Full-text search with advanced filters',
      },
      {
        icon: FileCode2,
        text: 'Project Organization - Group artifacts by projects',
      },
      {
        icon: GitBranch,
        text: 'Version Tracking - Monitor content evolution over time',
      },
      {
        icon: Zap,
        text: 'MCP Integration - Access from Claude, VS Code, Cursor',
      },
      {
        icon: Sparkles,
        text: 'Markdown Rendering - Beautiful syntax-highlighted previews',
      },
    ],
  },
  faq: {
    heading: 'Frequently Asked Questions',
    subheading: 'Everything you need to know about artifacts management',
    faqs: [
      {
        q: 'What types of content can I store as artifacts?',
        a: 'Store any AI-generated content: code snippets, documentation, work reports, data structures, meeting summaries, analysis reports, and more. Artifacts support markdown formatting and syntax highlighting.',
      },
      {
        q: 'How are artifacts organized?',
        a: 'Artifacts are organized by projects with intelligent categorization into work reports, static contexts (code/docs), and general content. Use tags, custom metadata, and unique slugs for easy organization.',
      },
      {
        q: 'Can AI tools access my artifacts automatically?',
        a: 'Yes! Through MCP integration, AI tools like Claude, Cursor, and VS Code can create, search, retrieve, and update artifacts directly from your conversations without manual intervention.',
      },
      {
        q: 'How does search and filtering work?',
        a: "Powerful full-text search across all artifact content, titles, and descriptions. Filter by project, type, status (active/expired), creation date, and any custom metadata fields you've added.",
      },
      {
        q: 'Can I version control my artifacts?',
        a: 'Yes! Artifacts include creation and modification timestamps, status management (active/expired), and you can track how your content evolves over time with audit trails.',
      },
    ],
  },
  cta: {
    heading: 'Ready to Organize Your AI Content?',
    description:
      'Transform scattered AI outputs into organized, searchable knowledge bases. Free and open source, self-host it.',
    campaign: 'artifacts_management',
  },
}
