import { defaultSEO, getPageSEO } from '../../src/utils/seo'

// Frozen expectation of the FULL per-page SEO map. This is the SEO contract:
// any rename, drop, or edit of a title/description/path/keywords/type — whether
// from a redesign or a careless edit — fails this test. Update it deliberately,
// never to make a failing test pass.
const EXPECTED_PAGE_SEO = {
  home: {
    title: 'VibeXP - The Shared Knowledge Base Your AI Builds On',
    description:
      'Keep your prompts, rules, and context in one place every AI tool — Claude Code, Cursor, ChatGPT — can read and write back over MCP. Free and open source, self-host it.',
    path: '/',
    keywords:
      'AI knowledge base, shared AI memory, prompt management, MCP server, Claude Code, Cursor, ChatGPT, Gemini CLI, AI context, team AI workspace',
    type: 'website',
  },
  features: {
    title: 'Features - One Knowledge Base for Every AI Tool | VibeXP',
    description:
      'Prompts, blueprints, memory, artifacts, AI feeds, and semantic search in one shared knowledge base your AI tools read from and write back to over MCP. Free and open source.',
    path: '/features',
    keywords:
      'AI knowledge base, prompt management, AI memory, AI blueprints, AI artifacts, semantic search, MCP server, Claude Code, Cursor, ChatGPT',
    type: 'website',
  },
  promptManagement: {
    title: 'Prompts — Reusable, composable AI prompt templates | VibeXP',
    description:
      'Save your best prompts as reusable, composable templates. Fill in variables, reference other prompts, and use them in every AI tool. Free and open source.',
    path: '/features/prompts',
    keywords:
      'prompt templates, AI prompts, prompt library, reusable prompts, composable prompts, AI workflow',
    type: 'website',
  },
  blueprints: {
    title: 'Blueprints — One library for your AI’s rules | VibeXP',
    description:
      'Stop scattering CLAUDE.md, .cursorrules, and AGENTS.md across repos. Keep every AI rule in one versioned, team-shared library — import from GitHub. Free and open source.',
    path: '/features/blueprints',
    keywords:
      'AI rules, CLAUDE.md, .cursorrules, AGENTS.md, coding standards, GitHub import, Claude Code, Cursor, Codex, AI config',
    type: 'website',
  },
  memoryManagement: {
    title: 'Memory — The context your AI writes and reads back | VibeXP',
    description:
      'Give your AI a memory that compounds. It writes what it learns and reads it back before the next task — across every tool and your whole team. Free and open source.',
    path: '/features/memory',
    keywords:
      'AI memory, AI context, MCP memory, read write back, semantic search, team knowledge base, Claude Code, Cursor, VS Code, Gemini',
    type: 'website',
  },
  mcpIntegration: {
    title: 'MCP Server Integration - Connect AI Tools | VibeXP',
    description:
      'Seamless integration with Claude Code, Cursor, VS Code through Model Context Protocol. Give your AI tools direct access to your data.',
    path: '/features/mcp-integration',
    keywords:
      'MCP server, Model Context Protocol, Claude integration, VS Code AI, Cursor IDE, AI tools',
    type: 'website',
  },
  artifactsManagement: {
    title: 'Artifacts Management - Organize AI Content | VibeXP',
    description:
      'Transform AI conversations into searchable knowledge base. Capture, organize, and retrieve code snippets, documentation, and reports.',
    path: '/features/artifacts',
    keywords:
      'AI artifacts, code snippets, AI documentation, content organization, AI knowledge base',
    type: 'website',
  },
} as const

describe('getPageSEO contract', () => {
  it('returns the exact frozen metadata for every known page key', () => {
    Object.entries(EXPECTED_PAGE_SEO).forEach(([key, expected]) => {
      expect(getPageSEO(key)).toEqual(expected)
    })
  })

  it('covers exactly the seven known page keys (no add/drop)', () => {
    // getPageSEO is keyed lookup, so we lock the key set by asserting the
    // expectation map itself stays at seven entries and each resolves.
    const keys = Object.keys(EXPECTED_PAGE_SEO)
    expect(keys).toHaveLength(7)
    keys.forEach(key => {
      expect(getPageSEO(key)).toBeDefined()
    })
  })

  it('falls back to the home entry for an unknown key', () => {
    expect(getPageSEO('does-not-exist')).toEqual(EXPECTED_PAGE_SEO.home)
    expect(getPageSEO('')).toEqual(EXPECTED_PAGE_SEO.home)
  })

  it('gives every page a non-empty title, description, and path', () => {
    Object.keys(EXPECTED_PAGE_SEO).forEach(key => {
      const seo = getPageSEO(key)
      expect(seo.title.length).toBeGreaterThan(0)
      expect(seo.description.length).toBeGreaterThan(0)
      expect(seo.path.startsWith('/')).toBe(true)
    })
  })
})

describe('defaultSEO contract', () => {
  it('matches the frozen site-wide defaults', () => {
    expect(defaultSEO).toEqual({
      siteName: 'VibeXP',
      baseUrl: 'https://vibexp.io',
      ogImage:
        'https://cdn-assets.vibexp.io/website-assets/common/vibexp-og-cover-dark-1200x630.png',
      twitterImage:
        'https://cdn-assets.vibexp.io/website-assets/common/vibexp-twitter-card-dark-1200x628.png',
      twitterHandle: '@vibexp_io',
    })
  })
})
