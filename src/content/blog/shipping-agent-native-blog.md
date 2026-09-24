---
title: Shipping an Agent-Native Blog
date: '2026-05-20'
lastmod: '2026-05-21'
description: >-
  How VibeXP builds a file-based, agent-friendly blog where every post is a
  typed markdown file validated at build time.
tags:
  - engineering
  - astro
  - content
categories:
  - engineering
keywords:
  - agent-native
  - content collections
  - astro blog
schema:
  publisherType: Organization
faq:
  - q: Why file-based authoring instead of a CMS?
    a: >-
      Markdown files live in git, review like code, and let agents author posts
      with the same tools they use for the rest of the codebase.
  - q: What happens if a post has invalid frontmatter?
    a: >-
      The Zod schema fails the build, so broken content never reaches
      production. A bad post is a failed build, not a broken page.
---

An agent-native blog treats every post as a typed artifact. Authors — human or
agent — write a markdown file, and a Zod schema validates the frontmatter at
build time.

## Why this matters

Build-time validation turns content mistakes into failed builds instead of
broken pages. The schema is the contract that every downstream page renders
against.

## What an agent writes

A single markdown file with frontmatter (`title`, `date`, `description`,
`tags`, and optional `cover`, `faq`, and `categories`) plus a markdown body.
Nothing else is required to ship a post.
