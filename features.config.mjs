/**
 * The feature pages, as data.
 *
 * Every /features/<slug>/ page is the same argument in the same order - the
 * promise, the three costs of the status quo, how it works, how your AI
 * reaches it, the questions people ask - so the page is one template
 * (src/pages/features/[slug].astro) and the words live here. The hub at
 * /features/ lists the same entries, so a feature cannot exist on one and be
 * missing from the other.
 *
 * The slugs are the old site's routes, kept so the links and the search
 * ranking they earned keep working.
 *
 * Like faq.config.mjs, every claim here is taken from docs/. Write nothing the
 * docs do not already say, and link to the page that says it. `a` in a FAQ is
 * plain text, because it is also emitted as `FAQPage` structured data.
 *
 * `closer` is the heading of the dark band at the foot of the page.
 *
 * `code` blocks are rendered as the design's inverted code panel. Tokens are
 * `[text, class?]` pairs, where the class is one of the code palette's `k`
 * (keyword), `s` (string) or `c` (comment).
 */
export const FEATURES = [
  {
    slug: 'prompts',
    closer: 'Build a prompt library you will actually reuse.',
    name: 'Prompts',
    summary: 'Reusable, composable instructions. Reference one prompt inside another and fill in variables, so you build instead of rewrite.',
    title: 'Prompts - reusable, composable AI prompt templates | VibeXP',
    description:
      'Save your best prompts once as reusable, composable templates. Fill in variables, reference other prompts, and reach them from every AI tool over MCP. Free and open source.',
    eyebrow: 'Your reusable library',
    h1: ['Stop rewriting the ', 'same prompts', '.'],
    lede: 'Save your best prompts once as templates. Fill in {{variables}}, reference other prompts with @, and reach the result from every AI tool you use, over one MCP connection.',
    docs: '/docs/user-guide/prompts/',
    pains: [
      { h: 'You rewrite from memory', p: 'The prompt that worked last week is being retyped now: slightly worse, a few minutes slower, every single time.' },
      { h: 'Results are inconsistent', p: 'Different wording every time means different quality every time. With no standard to reach for, the output drifts.' },
      { h: 'They are lost in chat history', p: 'Buried in a ChatGPT thread, a notes app or a teammate\'s head. A prompt you cannot find is a prompt you do not have.' },
    ],
    panels: [
      {
        eyebrow: 'Composable building blocks',
        h: 'Build prompts from prompts',
        p: 'Type @ inside a prompt to embed another one by reference, and wrap anything that changes in {{double braces}}. Update a building block once and every prompt that uses it stays in step.',
        list: [
          ['Dependency graph.', 'A live uses and used-by map, and a prompt others reference is protected from accidental deletion.'],
          ['Render before you send.', 'Fill the variables, including inherited ones, and see the exact text your AI will receive.'],
        ],
        code: [
          [['# code-review', 'c']],
          [['Review this '], ['{{language}}', 's'], [' diff.']],
          [['Apply '], ['@coding-standards', 'k'], [' and report using '], ['@output-format', 'k'], ['.']],
        ],
        more: { label: 'Advanced features', path: '/docs/user-guide/prompts/advanced-features/' },
      },
      {
        eyebrow: 'Every tool, one library',
        h: 'Write it once, use it everywhere',
        p: 'Expose a prompt over MCP and it shows up inside Claude Code, Cursor, VS Code and Gemini CLI as a native prompt, or your agent renders it by slug. The CLI and REST API reach the same library.',
        list: [
          ['Version history.', 'Every change is snapshotted with its author; diff any two versions and restore without losing newer work.'],
          ['Labels, projects and search.', 'Group, tag and find prompts by meaning rather than by exact words.'],
        ],
        code: [
          [['vibexp_io_render_prompt', 'k'], ['(']],
          [['  slug: '], ['"code-review"', 's'], [',']],
          [['  values: { language: '], ['"Go"', 's'], [' }']],
          [[')']],
        ],
        more: { label: 'Prompts over MCP', path: '/docs/user-guide/mcp-server/#prompt-management' },
      },
    ],
    faq: [
      { q: 'How do variables work?', a: 'Wrap any changeable part of a prompt in {{double braces}} to turn it into a fill-in-the-blanks template. When you use the prompt, you fill in the values and VibeXP renders the final text.', more: '/docs/user-guide/prompts/advanced-features/' },
      { q: 'What are @-references?', a: 'Type @ inside a prompt to embed another prompt by reference. The referenced text is inlined when the prompt is rendered, so you maintain one building block and every prompt that uses it stays in sync.', more: '/docs/user-guide/prompts/advanced-features/' },
      { q: 'Which tools can use my prompts?', a: 'Any MCP client that supports MCP OAuth, over a single connection: Claude Code, Cursor, VS Code, Gemini CLI and more. The CLI and the REST API reach the same prompts.', more: '/docs/user-guide/mcp-server/' },
      { q: 'Can I track and roll back changes?', a: 'Yes. Every change is snapshotted with its author and time. Diff any two versions and restore an earlier one without losing newer work.', more: '/docs/user-guide/prompts/managing-prompts/' },
    ],
  },
  {
    slug: 'blueprints',
    closer: 'Give your AI one set of rules to follow.',
    name: 'Blueprints',
    summary: 'The rules and guidelines that shape your AI\'s behaviour, organized per tool: Claude Code, Cursor, Codex.',
    title: 'Blueprints - one library for your AI\'s rules | VibeXP',
    description:
      'Stop scattering CLAUDE.md, .cursorrules and AGENTS.md across repos. Keep every AI rule in one versioned, team-shared library, imported from GitHub. Free and open source.',
    eyebrow: 'Your AI\'s rules, in one place',
    h1: ['Stop re-explaining your standards to ', 'every tool', '.'],
    lede: 'Your rules live in CLAUDE.md here, .cursorrules there and AGENTS.md somewhere else. Blueprints keeps every rule that shapes your AI in one versioned, team-shared library, imported straight from GitHub and organized per tool.',
    docs: '/docs/user-guide/blueprints/',
    pains: [
      { h: 'Rules are scattered', p: 'CLAUDE.md in one repo, .cursorrules in another, AGENTS.md somewhere else. No single source of truth for how your AI should behave.' },
      { h: 'They drift out of sync', p: 'You fix a convention in one place and forget the other four, and each tool slowly behaves a little differently.' },
      { h: 'You restate them every session', p: 'New chat, new tool, new teammate: the same standards, explained from scratch, again.' },
    ],
    panels: [
      {
        eyebrow: 'One-click GitHub import',
        h: 'Already wrote the rules? Bring them in',
        p: 'Connect a repository through the GitHub App and VibeXP imports the AI config you already keep there, classifying each file by the tool and kind it belongs to. Re-imports skip what is already there.',
        list: [
          ['Knows the layout.', 'Root CLAUDE.md and AGENTS.md, plus .claude/, .cursor/, .codex/ and .agents/.'],
          ['Keeps provenance.', 'Each imported blueprint records the repo, commit and time it came from.'],
        ],
        code: [
          [['# your-org/payments-api', 'c']],
          [['CLAUDE.md', 'k'], ['                  Claude Code'], ['  root file', 'c']],
          [['AGENTS.md', 'k'], ['                  Codex'], ['        root file', 'c']],
          [['.claude/agents/reviewer.md', 'k'], [' Claude Code'], ['  sub-agent', 'c']],
        ],
        more: { label: 'Importing from GitHub', path: '/docs/user-guide/blueprints/#importing-blueprints-from-github' },
      },
      {
        eyebrow: 'Prompts are what you ask',
        h: 'Blueprints are the rules it always follows',
        p: 'Every blueprint is typed for the tool it configures, so your AI reaches the right rules for the right tool. Your agent pulls them over MCP; nothing is written back to your repo.',
        list: [
          ['Version history.', 'Every edit is snapshotted and attributed. Restoring is itself a new version, so nothing is lost.'],
          ['Shared by the team.', 'New teammates inherit your conventions on day one instead of guessing.'],
        ],
        code: [
          [['vibexp_io_get_resource', 'k'], ['(']],
          [['  resource_type: '], ['"blueprint"', 's'], [',']],
          [['  slug: '], ['"claude-md"', 's']],
          [[')']],
        ],
        more: { label: 'Blueprints', path: '/docs/user-guide/blueprints/' },
      },
    ],
    faq: [
      { q: 'What is a blueprint, and how is it different from a prompt?', a: 'A blueprint is a stored, versioned Markdown document holding the rules and config that govern an AI tool: coding standards, instruction files such as CLAUDE.md and AGENTS.md, and tool config such as sub-agents, skills and slash-commands. A prompt is the task you ask for; a blueprint is the rule it always follows.', more: '/docs/user-guide/blueprints/' },
      { q: 'Can I import my existing CLAUDE.md, .cursorrules or AGENTS.md?', a: 'Yes. Connect your repository through the team GitHub App and import its AI-config files as per-tool blueprints. Only Markdown files are imported, each is classified by tool and kind, and re-imports skip blueprints that already exist.', more: '/docs/user-guide/blueprints/#importing-blueprints-from-github' },
      { q: 'Does VibeXP write rules back into my repository?', a: 'No. Import is one-directional, from GitHub into VibeXP. Your AI reads blueprints over MCP, and you can copy any of them anywhere you need it.', more: '/docs/user-guide/blueprints/' },
    ],
  },
  {
    slug: 'memory',
    closer: 'Give your AI a memory that grows with you.',
    name: 'Memory',
    summary: 'A central place your AI writes what it learns, and reads back before the next task.',
    title: 'Memory - the context your AI writes and reads back | VibeXP',
    description:
      'Give your AI a memory that compounds. It writes what it learns and reads it back before the next task, across every tool and your whole team. Free and open source.',
    eyebrow: 'The context your AI builds on',
    h1: ['Your AI forgets. ', 'This does not', '.'],
    lede: 'Memory is where your AI writes down what it learns and reads it back before the next task. Every session starts smarter than the last, in every tool you use, for everyone on your team.',
    docs: '/docs/user-guide/memory/',
    pains: [
      { h: 'Every session starts cold', p: 'You re-describe the project, the stack and the standards to every tool, every time.' },
      { h: 'Nothing carries over', p: 'What your AI worked out yesterday is gone today, and you become its memory, copying context from chat to chat.' },
      { h: 'Built-in memory is locked in', p: 'Claude\'s memory does not help in Cursor. Context is trapped per app and per account, never shared with your team.' },
    ],
    panels: [
      {
        eyebrow: 'Read, work, write back',
        h: 'Two explicit steps, over MCP',
        p: 'Before a task your agent searches memory by meaning and pulls the relevant context. As it works, it writes new lessons back. VibeXP does not watch your sessions: your AI reads and writes deliberately.',
        list: [
          ['Indexed on save.', 'A new memory is embedded the moment it is stored, so the next search finds it.'],
          ['Linked to what it explains.', 'Relate a memory to the artifact or blueprint it is about.'],
        ],
        code: [
          [['vibexp_io_create_memory', 'k'], ['(']],
          [['  text: '], ['"Postgres pool maxes out at 20 under load.', 's']],
          [['         '], ['pool_max 50 fixed the timeouts."', 's'], [',']],
          [['  labels: ['], ['"postgres"', 's'], [', '], ['"perf"', 's'], [']']],
          [[')']],
        ],
        more: { label: 'Memory over MCP', path: '/docs/user-guide/memory/#mcp-integration' },
      },
      {
        eyebrow: 'Find by meaning',
        h: 'Search context, not keywords',
        p: 'Semantic search finds the right memory when you do not remember the words, across memories, prompts, blueprints and artifacts. It is the same retrieval your agents call before they work.',
        list: [
          ['No title, no template.', 'A memory is free-form Markdown plus metadata, scoped to a project.'],
          ['Version history.', 'Every change is attributed; compare versions and restore safely.'],
        ],
        code: [
          [['vibexp_io_search', 'k'], ['(query: '], ['"why do requests time out?"', 's'], [')']],
          [['# memory    Postgres pool maxes out at 20...   0.93', 'c']],
          [['# blueprint backend statement timeouts...      0.71', 'c']],
        ],
        more: { label: 'Semantic search', path: '/docs/user-guide/memory/#semantic-search' },
      },
    ],
    faq: [
      { q: 'How does my AI actually remember?', a: 'Two explicit steps over MCP. Before a task, your agent searches memory by meaning and pulls the relevant context. As it works, it writes new lessons back through the memory tools. The only automatic part is indexing: a memory is embedded the moment it is saved.', more: '/docs/user-guide/memory/' },
      { q: 'How is this different from the memory built into Claude or ChatGPT?', a: 'Built-in memory lives inside one tool and one account. VibeXP memory is shared across every tool you use, and across everyone on your team, so context never gets stranded in one app.', more: '/docs/user-guide/memory/' },
      { q: 'What can I store as a memory?', a: 'Anything worth remembering: a fact, a decision, a snippet, a preference, a lesson learned. A memory is free-form text plus metadata, scoped to a project, with no title required.', more: '/docs/user-guide/memory/#what-are-memories' },
    ],
  },
  {
    slug: 'artifacts',
    closer: 'Keep everything your AI makes.',
    name: 'Artifacts',
    summary: 'The content your AI produces, saved with full version history. Diff and restore any version.',
    title: 'Artifacts - keep what your AI produces | VibeXP',
    description:
      'Save the reports, docs and code your AI produces as versioned, searchable artifacts your tools can create and read back over MCP. Free and open source.',
    eyebrow: 'Never lose AI-generated work',
    h1: ['Keep what your AI ', 'produces', '.'],
    lede: 'Reports, documentation, code and analysis your AI writes end up in scratch files and closed chats. Artifacts keeps them in one searchable, versioned place, and your AI can create and read them itself.',
    docs: '/docs/user-guide/artifacts/',
    pains: [
      { h: 'Output disappears with the chat', p: 'The review or the report your AI wrote an hour ago is gone the moment the session closes.' },
      { h: 'Nobody can find it later', p: 'What survives is a file on one laptop, invisible to your next session and to your team.' },
      { h: 'No history of how it changed', p: 'The next revision overwrites the last one, and the version you liked is not coming back.' },
    ],
    panels: [
      {
        eyebrow: 'Created by your AI',
        h: 'Your agent saves its own work',
        p: 'Through MCP, your AI tools create, search, retrieve and update artifacts straight from the conversation. Group them by project, type and status, and add metadata you can filter on.',
        list: [
          ['Linked to its sources.', 'A new version of a document supersedes the one it replaces.'],
          ['Bulk operations.', 'Update status or delete in batches from the app.'],
        ],
        code: [
          [['vibexp_io_create_artifact', 'k'], ['(']],
          [['  title: '], ['"Q3 incident review"', 's'], [',']],
          [['  content: '], ['"## Timeline ..."', 's']],
          [[')']],
        ],
        more: { label: 'Artifacts over MCP', path: '/docs/user-guide/artifacts/#mcp-integration' },
      },
      {
        eyebrow: 'Version history',
        h: 'Diff it. Restore it.',
        p: 'Every save snapshots the previous content as a numbered version. Browse the history, open any snapshot, diff it against the current content and roll back.',
        list: [
          ['Restore is non-destructive.', 'The pre-restore content is snapshotted first, so you can move forward again.'],
          ['Full-text and semantic search.', 'Find any artifact by content, title or meaning.'],
        ],
        code: [
          [['# v5 -> v6', 'c']],
          [['- ', 'c'], ['Report issues found.']],
          [['+ ', 'k'], ['Report as: severity, file:line, fix.']],
        ],
        more: { label: 'Update and version', path: '/docs/user-guide/artifacts/#update-and-version' },
      },
    ],
    faq: [
      { q: 'What can I store as an artifact?', a: 'Any substantial AI-generated content: code, documentation, work reports, meeting summaries, analysis. Artifacts are Markdown, rendered with syntax highlighting.', more: '/docs/user-guide/artifacts/' },
      { q: 'Can AI tools create artifacts on their own?', a: 'Yes. Over MCP, tools such as Claude Code, Cursor and VS Code can create, search, retrieve and update artifacts directly from a conversation.', more: '/docs/user-guide/artifacts/#mcp-integration' },
      { q: 'How long is version history kept?', a: 'Each artifact keeps a bounded number of versions, 20 by default. The operator of your instance can raise the limit or turn pruning off.', more: '/docs/user-guide/artifacts/#update-and-version' },
    ],
  },
  {
    slug: 'mcp-integration',
    closer: 'Connect every AI tool, once.',
    name: 'MCP integration',
    summary: 'One endpoint every MCP client connects to, with browser sign-in and no API key to copy.',
    title: 'MCP server - connect every AI tool to your knowledge | VibeXP',
    description:
      'VibeXP exposes one MCP endpoint with an embedded OAuth 2.1 server. Paste the URL into Claude Code, Cursor or VS Code, approve once in the browser, and your AI reads and writes your knowledge.',
    eyebrow: 'Model Context Protocol',
    h1: ['One URL. ', 'Every AI tool', '.'],
    lede: 'VibeXP serves a single, team-agnostic MCP endpoint with its own OAuth 2.1 authorization server. Paste the URL into your client, approve once in the browser, and your AI can read and write your prompts, rules, memory, artifacts and feeds.',
    docs: '/docs/user-guide/mcp-server/',
    pains: [
      { h: 'Keys to copy and rotate', p: 'Most integrations start with generating a secret, pasting it into a config file and remembering to rotate it.' },
      { h: 'One integration per tool', p: 'Every new editor or agent needs its own plugin, and the context it can reach differs from the last one.' },
      { h: 'Copy and paste as the API', p: 'Without a connection, you are the bridge, moving context between your notes and the chat by hand.' },
    ],
    panels: [
      {
        eyebrow: 'Connect',
        h: 'Paste one URL, approve once',
        p: 'The client discovers VibeXP\'s authorization server, registers itself and opens a consent screen in your browser. Approve it and the client keeps a short-lived, audience-bound token that it refreshes on its own.',
        list: [
          ['No key, no client id, no secret.', 'Dynamic client registration and PKCE handle it.'],
          ['Team context per call.', 'Team-scoped tools take a team_id, so one connection reaches every team you belong to.'],
        ],
        code: [
          [['claude', 'k'], [' mcp add --transport http vibexp \\']],
          [['  '], ['https://vibexp.example.com/mcp/v1/common', 's']],
        ],
        more: { label: 'How OAuth connect works', path: '/docs/user-guide/mcp-server/#how-oauth-connect-works' },
      },
      {
        eyebrow: 'What your AI can do',
        h: 'Read, write and relate',
        p: 'Search across every kind of knowledge, render prompts, read and write memories, artifacts and blueprints, post to feeds, and link resources to each other, all as MCP tools.',
        list: [
          ['Any OAuth-capable client.', 'Claude Code, Cursor, VS Code, Gemini CLI, Codex and ChatGPT.'],
          ['Local development is zero-config.', 'A localhost instance enables MCP auth automatically.'],
        ],
        code: [
          [['vibexp_io_search', 'k'], ['          ', 'c'], ['# find by meaning', 'c']],
          [['vibexp_io_render_prompt', 'k'], ['   ', 'c'], ['# fill a template', 'c']],
          [['vibexp_io_create_memory', 'k'], ['   ', 'c'], ['# write back', 'c']],
          [['vibexp_io_post_to_feed', 'k'], ['    ', 'c'], ['# report progress', 'c']],
        ],
        more: { label: 'Every available tool', path: '/docs/user-guide/mcp-server/#available-tools' },
      },
    ],
    faq: [
      { q: 'What is the Model Context Protocol?', a: 'An open standard for connecting AI tools to external data and tools. VibeXP implements it so any MCP client can reach your knowledge base through one endpoint.', more: '/docs/user-guide/mcp-server/#what-is-mcp' },
      { q: 'Can I use an API key with the MCP endpoint?', a: 'No. The MCP endpoint accepts only OAuth bearer tokens issued by the connect flow, and rejects API keys. API keys are for the CLI, the REST API and your own scripts.', more: '/docs/user-guide/mcp-server/#api-keys-still-apply-outside-mcp' },
      { q: 'What if my client does not support MCP OAuth?', a: 'Then it cannot connect to the VibeXP MCP endpoint today. Clients that implement auto-discovery, dynamic client registration and PKCE connect by pasting the URL.', more: '/docs/user-guide/mcp-server/#for-other-clients' },
    ],
  },
];

/**
 * The hub also lists two capabilities that have documentation but no page of
 * their own. They are data rather than markup so the hub renders one list.
 */
export const MORE_FEATURES = [
  { name: 'Feeds', summary: 'Agents post their work over MCP and you reply in the thread to steer them.', path: '/docs/user-guide/feeds/' },
  { name: 'Semantic search', summary: 'Find anything across prompts, artifacts, blueprints and memory by meaning, not keywords.', path: '/docs/user-guide/search/' },
];
