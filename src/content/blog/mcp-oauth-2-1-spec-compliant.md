---
title: "VibeXP's MCP Server Is Now Fully MCP-Spec Compliant (OAuth 2.1)"
date: '2026-05-31'
description: >-
  VibeXP's MCP server now implements the official MCP authorization spec as an
  OAuth 2.1 Resource Server. Spec-compliant clients connect with zero config —
  paste the URL, sign in, done. No API keys, no secrets in your config.
tags:
  - mcp
  - oauth
  - security
  - announcement
categories:
  - product
keywords:
  - mcp oauth
  - oauth 2.1 resource server
  - mcp authorization spec
  - zero config mcp
  - workos authkit
cover:
  image: /assets/blog/cover.png
  alt: Abstract activity-pulse motif over concentric rings on a dark background.
schema:
  publisherType: Organization
faq:
  - q: Do I need an API key to connect an MCP client to VibeXP?
    a: >-
      No. The MCP endpoint now accepts only OAuth tokens. Paste
      https://connect.vibexp.io/mcp/v1/common into an OAuth-capable client and
      sign in — the client handles the rest. API keys still work for CLI and
      programmatic use on non-MCP routes.
  - q: I connected MCP with an API key before. Do I need to do anything?
    a: >-
      Yes. Reconnect via OAuth. API keys now return 401 on the MCP endpoint,
      whether passed as a query parameter or an Authorization header. Re-add the
      endpoint in an OAuth-capable client and sign in.
---

VibeXP's MCP server is now a fully spec-compliant OAuth 2.1 Resource Server. It
implements the official MCP authorization specification (2025-06-18) and
delegates authorization to WorkOS AuthKit (WorkOS is VibeXP's unified
authentication provider — the same identity layer that already handles sign-in
across VibeXP). For you, that means connecting an MCP client is now zero-config:
paste the URL, sign in, done.

## What changed

`https://connect.vibexp.io/mcp/v1/common` is now an OAuth 2.1 Resource Server.
It no longer issues or signs its own tokens — it verifies AuthKit-issued bearer
JWTs and delegates authorization to WorkOS AuthKit, the standard way described
by the MCP authorization spec.

Concretely, that brings three things to the table:

- **Audience-bound tokens** (RFC 8707) — every token's `aud` is the MCP resource
  URI, so a token minted for VibeXP only works against VibeXP.
- **Protected-resource discovery** (RFC 9728) — clients can discover how to
  authenticate without you wiring anything up by hand.
- **No credentials in the URL** — tokens are short-lived, audience-bound JWTs,
  never long-lived secrets pasted into a config file or query string.

## Why it matters

The payoff is interoperability. Because the endpoint speaks the standard MCP
OAuth flow, OAuth-capable clients connect with zero configuration. There is no
`client_id` to copy, no secret to paste, no API key to manage. You give the
client a URL and it does the discovery, registration, and login for you.

It is also simply more secure. Long-lived API keys in config files and URLs are
a liability — they leak, they get committed, they linger. Short-lived,
audience-bound JWTs do not.

## How to connect now

Paste this URL into an OAuth-capable MCP client such as Claude, Claude Code, or
Cursor:

```text
https://connect.vibexp.io/mcp/v1/common
```

Then sign in. Behind the scenes the client auto-discovers AuthKit, self-registers
via Dynamic Client Registration, runs PKCE with login and consent, and receives
an audience-bound token. You do not configure a `client_id` or secret, and you
never paste an API key.

That is the whole flow: paste the URL, sign in, start working.

## Migration note

If you previously connected MCP using an API key — whether as a `?api_key=`
query parameter or an `Authorization: Bearer <api_key>` header — you need to
reconnect via OAuth. The insecure query-param path is gone (tokens should never
travel in a URL), and API keys now return `401` on the MCP endpoint.

Your API keys are not revoked. They remain valid for CLI, programmatic, and
other non-MCP use. Only the MCP endpoint requires OAuth.

One honest caveat: only OAuth-capable MCP clients can connect to MCP now. The
clients listed above support the MCP OAuth flow today. If your client does not
yet support MCP OAuth, it cannot connect to the MCP endpoint until it does.

## Get started

Open an OAuth-capable MCP client, add `https://connect.vibexp.io/mcp/v1/common`,
and sign in. No keys, no secrets, no setup.

New to VibeXP? [Start for free at vibexp.io](https://vibexp.io) — no credit card
required.
