import {
  Boxes,
  Code2,
  Cpu,
  Globe,
  KeyRound,
  Link2,
  Lock,
  Plug,
  Rocket,
  ScrollText,
  Settings2,
  Shield,
  Sparkles,
  Target,
  Terminal,
  Wrench,
  Zap,
} from 'lucide-react'

import { trackEvent } from '@/utils/gtm'

import type { FeaturePageConfig } from '../types'

export const mcpIntegrationConfig: FeaturePageConfig = {
  seoKey: 'mcpIntegration',
  stickyCta: {
    text: 'Give Your AI Direct Access to Your Data',
    mobileText: 'View on GitHub',
    buttonText: 'View on GitHub',
    campaign: 'mcp_integration',
  },
  hero: {
    eyebrow: 'Give Your AI Assistants Direct Access to Your Data & Tools',
    heading: 'MCP Server Integration',
    subcopy:
      "VibeXP's MCP server acts as a bridge between your AI tools and your organized data ecosystem, giving your AI assistants direct access to your prompts, artifacts, and memories.",
  },
  stats: {
    columnsClassName: 'md:grid-cols-2',
    stats: [
      { value: 'Open standard', label: 'Built on MCP', icon: Zap },
      { value: 'Real-time', label: 'Data Sync', icon: Sparkles },
    ],
  },
  whatIs: {
    heading: 'What is MCP Server Integration?',
    description: [
      'VibeXP implements the Model Context Protocol (MCP) - an open standard that enables AI tools to securely connect to your data.',
      'Your AI conversations get supercharged with your personal knowledge base, artifacts, and prompts through simple, secure connections.',
    ],
    columnsClassName: 'md:grid-cols-2 lg:grid-cols-4',
    features: [
      {
        icon: Cpu,
        title: 'AI Tools',
        description: 'Claude, Cursor, VS Code',
      },
      {
        icon: Zap,
        title: 'VibeXP MCP Server',
        description: 'Secure Bridge via the MCP Protocol',
      },
      {
        icon: Boxes,
        title: 'Your Data',
        description: 'Prompts • Artifacts • Memories',
      },
      {
        icon: Lock,
        title: 'Secure Access',
        description: 'Authorized tools only',
      },
    ],
  },
  screenshots: {
    heading: 'See MCP Integration in Action',
    subheading: 'Connect your AI services seamlessly',
    hint: 'Hover to pause • Click to view larger',
    autoPlayInterval: 4000,
    ariaLabel: 'MCP Integration screenshots',
    screenshots: [
      {
        src: '/images/screenshots/mcp_server_homoepage.png',
        alt: 'MCP Server Integration',
        title: 'MCP Server Setup',
        description:
          'Configure your MCP server with simple setup instructions for Claude Code CLI, Cursor IDE, and VS Code',
        icon: Zap,
      },
      {
        src: '/images/screenshots/claude_code_session_list_page.png',
        alt: 'Claude Code Sessions List',
        title: 'Session Tracking',
        description:
          'Monitor all your Claude Code sessions with detailed metrics, hooks usage, and tool activity',
        icon: ScrollText,
      },
      {
        src: '/images/screenshots/Claude_code_session_details.png',
        alt: 'Claude Code Session Details',
        title: 'Session Details',
        description:
          'Deep dive into individual sessions with hook filtering, tool usage tracking, and detailed event logs',
        icon: Target,
      },
    ],
  },
  benefits: {
    heading: 'Boost Productivity with Seamless Integration',
    subheading: 'Connect once, supercharge forever',
    columnsClassName: 'md:grid-cols-2',
    benefits: [
      {
        icon: Link2,
        title: 'Direct AI Service Integration',
        points: [
          'AI services access your VibeXP data without manual copy-pasting',
          'Instant access to your latest prompts, artifacts, and memories',
          'Work naturally within your favorite AI tools',
        ],
        popular: false,
      },
      {
        icon: Shield,
        title: 'Secure Data Access',
        points: [
          'Secure access control for authorized tools only',
          'Control exactly what data is accessible',
          'Your data stays secure while enabling powerful interactions',
        ],
        popular: true,
      },
      {
        icon: Rocket,
        title: 'Enhanced AI Capabilities',
        points: [
          'AI tools execute your curated prompts with proper context',
          'Retrieve and reference stored code snippets',
          'AI assistants utilize your stored knowledge automatically',
        ],
        popular: false,
      },
      {
        icon: Target,
        title: 'Multi-Tool Support',
        points: [
          'Direct integration with Claude Code CLI',
          'Native support for Cursor IDE',
          'Compatible with VS Code MCP extensions',
          'Built on open standards for emerging AI tools',
        ],
        popular: false,
      },
    ],
  },
  howItWorks: {
    heading: 'How MCP Integration Works',
    subheading: 'Simple setup, powerful results',
    steps: [
      {
        title: 'Server Setup & Authentication',
        description:
          'VibeXP hosts your personal MCP server at https://connect.vibexp.io/mcp/v1/common, providing secure HTTP-based access to your data ecosystem. Authentication is handled through your VibeXP API keys.',
      },
      {
        title: 'AI Tool Configuration',
        description:
          'Configure your AI tools to connect using simple configuration snippets for Claude Code CLI, Cursor IDE, or VS Code.',
      },
      {
        title: 'Available Tools & Capabilities',
        description:
          'Your connected AI tools gain access to DateTime tools, Artifact Management, Memory Operations, and Prompt Integration.',
      },
      {
        title: 'Seamless Workflow Integration',
        description:
          'Once configured, your AI tools can reference your artifacts, execute your prompts, store insights, and maintain context automatically.',
      },
      {
        title: 'Security & Privacy',
        description:
          'All data transfer uses HTTPS encryption with secure token-based authentication, user isolation, and audit trails.',
      },
    ],
  },
  extraSections: [
    {
      kind: 'whyChoose',
      props: {
        heading: 'Works seamlessly with',
        columnsClassName: 'md:grid-cols-4',
        items: [
          { icon: Zap, text: 'Claude Code' },
          { icon: Code2, text: 'Cursor' },
          { icon: Wrench, text: 'VS Code' },
          { icon: Plug, text: 'Any MCP Client' },
        ],
      },
    },
    {
      kind: 'feature',
      props: {
        heading: 'Supported AI Tools',
        description: 'Works with your favorite development environment',
        columnsClassName: 'md:grid-cols-3',
        features: [
          {
            icon: Zap,
            title: 'Claude Code CLI',
            description: 'Full MCP server integration with all VibeXP features',
          },
          {
            icon: Code2,
            title: 'Cursor IDE',
            description: 'Complete access to prompts, artifacts, and memory',
          },
          {
            icon: Wrench,
            title: 'VS Code',
            description: 'Integration via MCP server for seamless workflow',
          },
        ],
      },
    },
    {
      kind: 'benefits',
      props: {
        heading: 'Getting Started',
        columnsClassName: 'md:grid-cols-3',
        benefits: [
          {
            icon: Settings2,
            title: 'Prerequisites',
            points: [
              'VibeXP Account',
              'API Key from Dashboard',
              'Supported AI Tool',
            ],
          },
          {
            icon: Terminal,
            title: 'Setup Process',
            points: [
              'Create Content in VibeXP',
              'Generate API Key',
              'Configure AI Tool',
            ],
          },
          {
            icon: Rocket,
            title: 'Start Creating',
            points: [
              'Access Your Data',
              'Enhanced AI Conversations',
              'Boost Productivity',
            ],
          },
        ],
      },
    },
    {
      kind: 'feature',
      props: {
        heading: 'Enterprise-Grade Security & Trust',
        description: 'Your data security is our top priority',
        columnsClassName: 'md:grid-cols-3',
        features: [
          {
            icon: Lock,
            title: 'HTTPS Encryption',
            description: 'All data transfer uses TLS 1.3 encryption',
          },
          {
            icon: KeyRound,
            title: 'API Key Auth',
            description: 'Secure token-based authentication',
          },
          {
            icon: Shield,
            title: 'User Isolation',
            description: 'Complete data separation per user',
          },
          {
            icon: ScrollText,
            title: 'Audit Trails',
            description: 'Complete logging of all access',
          },
          {
            icon: Globe,
            title: 'Global CDN',
            description: 'Low-latency worldwide access',
          },
        ],
      },
    },
  ],
  faq: {
    heading: 'Frequently Asked Questions',
    subheading: 'Everything you need to know about MCP integration',
    faqs: [
      {
        q: 'What is the Model Context Protocol (MCP)?',
        a: 'MCP is an open standard that enables AI applications to securely connect to external data sources. It provides a standardized way for AI tools like Claude Code, Cursor, and VS Code to access contextual information while maintaining strict security controls.',
      },
      {
        q: 'How long does it take to set up?',
        a: "Setup takes less than 5 minutes. Simply generate an API key from your VibeXP dashboard, add the MCP server configuration to your AI tool, and you're ready to go. No complex installation or configuration required.",
      },
      {
        q: 'Which AI services are supported?',
        a: 'Currently, we support Claude Code CLI, Cursor IDE, and VS Code via MCP extensions. Since MCP is an open standard, any tool that implements the protocol can connect to VibeXP.',
      },
      {
        q: 'Is my data secure?',
        a: 'Absolutely. All data transfer uses HTTPS encryption with TLS 1.3. Access is controlled via secure API key authentication, and we maintain complete user isolation. Your data is never shared between users, and all access is logged for audit purposes.',
      },
      {
        q: 'What can I access through MCP?',
        a: 'Through MCP, your AI tools can access your VibeXP prompts, artifacts (code snippets, documentation), and memories. They can also create new content and store insights back to your VibeXP account.',
      },
      {
        q: 'Is MCP integration part of the open-source project?',
        a: 'Yes. MCP integration is part of VibeXP, which is free and open source. Self-host it and connect your AI tools over MCP.',
      },
      {
        q: 'Can I revoke access?',
        a: 'Yes. You can revoke API keys at any time from your VibeXP dashboard. This immediately terminates access for any tools using that key.',
      },
    ],
  },
  cta: {
    heading: 'Ready to Supercharge Your AI Workflows?',
    description:
      'Connect your AI tools to VibeXP over MCP. Free and open source, self-host it.',
    campaign: 'mcp_integration',
    secondaryAction: {
      label: 'View Documentation',
      onClick: () => {
        trackEvent('navigation_click', {
          location: 'feature_page_cta',
          destination: 'documentation',
          campaign: 'mcp_integration',
        })
        window.open(
          'https://docs.vibexp.io/mcp',
          '_blank',
          'noopener,noreferrer'
        )
      },
    },
  },
}
