/**
 * The landing FAQ, in one place because it is rendered twice.
 *
 * Once as markup by src/components/Faq.astro, and once as `FAQPage` structured
 * data on the landing page. Two copies would drift, and drifted structured data
 * is worse than none: a search engine can show an answer the page does not
 * contain.
 *
 * These answer ON THE PAGE rather than linking away. The questions somebody has
 * before running anything ("is this just ChatGPT memory?", "where does my data
 * go?") should not cost them a page load, and deep links into docs are fragile
 * besides, since a heading rename breaks a fragment silently.
 *
 * Every answer is taken from docs/. If you change one here, change it there
 * too, or better, do not write anything here the docs do not already say.
 *
 * `a` is plain text with no markup: the schema needs a string, and an answer
 * that renders as one paragraph is an answer somebody can actually read.
 * `more.path` is a site path, joined onto the base by the component.
 */
export const FAQ = [
  {
    q: 'How is this different from the memory built into Claude or ChatGPT?',
    a: `Built-in memory lives inside one tool and one account. VibeXP is shared across
        every tool you use and everyone on your team, so your context follows you from
        Claude Code to Cursor to ChatGPT, and your team's knowledge compounds instead of
        being locked inside one vendor's app.`,
    more: { label: 'Memory', path: '/docs/user-guide/memory/' },
  },
  {
    q: 'Which AI tools does it work with?',
    a: `Anything that speaks the Model Context Protocol and its OAuth 2.1 sign-in flow:
        Claude Code, Cursor, VS Code, Gemini CLI, Codex, ChatGPT and more. Every one of
        them connects to the same single endpoint on your instance, and one connection
        reaches your prompts, rules, memory, artifacts and feeds.`,
    more: { label: 'MCP server', path: '/docs/user-guide/mcp-server/' },
  },
  {
    q: 'Do I need an API key to connect my AI tools?',
    a: `No. You paste one URL into your MCP client, it opens a consent screen in the
        browser, and you approve it once. There is no key, client id or secret to copy.
        API keys do exist, separately, for the CLI, the REST API and your own scripts.`,
    more: { label: 'How OAuth connect works', path: '/docs/user-guide/mcp-server/#how-oauth-connect-works' },
  },
  {
    q: 'Is there a hosted version, or do I run it myself?',
    a: `You run it. VibeXP is free and open source under AGPL-3.0, and ships as one
        container image that serves the app, the API and the MCP endpoint from a single
        port, next to PostgreSQL with pgvector. docker compose up gets you a local
        instance with nothing to configure; a public one needs a URL, a few secrets and
        an identity provider.`,
    more: { label: 'Self-hosting', path: '/docs/user-guide/self-hosting/' },
  },
  {
    q: 'I work alone. Is it useful before I have a team?',
    a: `Yes. Centralize your prompts, rules and memory today and your own AI gets more
        consistent from the first session, because it reads what you saved before it
        starts. Invite your team whenever you are ready and the same knowledge base
        becomes shared.`,
    more: { label: 'Quick start', path: '/docs/user-guide/quick-start/' },
  },
  {
    q: 'How does my AI actually remember things?',
    a: `Your tools write what they learn back into VibeXP over MCP, then read it before
        the next task. It is an explicit step the agent takes through the memory tools,
        not a guess, so the knowledge base grows with every session and travels with you
        across every tool.`,
    more: { label: 'Memory', path: '/docs/user-guide/memory/' },
  },
  {
    q: 'Where does my data live?',
    a: `On the server you run it on, in your own PostgreSQL database. There is no VibeXP
        cloud behind the open-source build for your data to pass through. Semantic
        search, email and file attachments are opt-in, and each one talks only to the
        provider you configure for it.`,
    more: { label: 'Self-hosting', path: '/docs/user-guide/self-hosting/' },
  },
];
