# vibexp.io

The website, documentation and blog for [VibeXP](https://github.com/vibexp/vibexp),
the open-source knowledge base your AI tools read from and write back to.
Published at **[vibexp.io](https://vibexp.io)**.

| Path | What it is |
| --- | --- |
| `/` | Landing page |
| `/features/`, `/how-it-works/` | Feature pages |
| `/docs/` | Documentation, generated from [`docs/`](docs/README.md) |
| `/blog/` | Blog, from [`src/content/blog/`](src/content/blog/) |

It is built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build), on the same template and design
system (`@shaharia-lab/agento-code`) as the other Shaharia Lab open-source sites.

## Working on it

```bash
npm ci
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run check        # type check
npm run check:links  # every internal link resolves
```

- **Fix or add documentation:** edit the Markdown under [`docs/`](docs/). A new
  page also needs an entry in [`docs.manifest.mjs`](docs.manifest.mjs).
- **Write a blog post:** add a Markdown file to `src/content/blog/`; the
  filename becomes its URL.

Pushes to `main` deploy to GitHub Pages. See [CLAUDE.md](CLAUDE.md) for how the
pieces fit together.

## License

[AGPL-3.0-or-later](LICENSE)
