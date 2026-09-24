---
title: 'Harness Engineering Explained: Why an AI Agent Is Model + Harness'
date: '2026-06-27'
description: >-
  Harness engineering is everything built around an AI model (the loop, tools,
  memory, and guardrails) that turns a raw text generator into an agent that
  reliably gets real work done. A plain-language guide.
tags:
  - ai-agents
  - harness-engineering
  - llm
  - agent-architecture
  - engineering
categories:
  - engineering
keywords:
  - harness engineering
  - what is harness engineering
  - ai agent harness
  - agent model plus harness
  - ai agent architecture
  - llm agent loop
  - context engineering
cover:
  image: /assets/blog/harness-engineering-model-and-harness-banner.png
  alt: A lone activity-pulse icon (a raw model) points along a dashed arrow to the same icon as a bright core wrapped in concentric layers and ringed by tool icons (the model surrounded by its harness).
schema:
  publisherType: Organization
faq:
  - q: What is harness engineering?
    a: >-
      Harness engineering is the practice of building everything that wraps
      around an AI model (the loop, context, tools, memory, sandbox,
      permissions, and observability) so a raw text generator becomes an agent
      that reliably completes real tasks. Agent = Model + Harness.
  - q: What is the difference between an AI model and an AI agent?
    a: >-
      A model just turns text in into text out. An agent is a model plus a
      harness. The harness adds the memory, the ability to act through tools,
      the verification, and the stopping conditions a raw model lacks, so the
      system can actually finish work instead of only describing it.
  - q: Why does the harness matter more than the model?
    a: >-
      The gap between what a model can do and what you actually see it do is
      usually a harness problem, not a model problem. Keeping the model fixed
      and improving only the harness has moved coding agents dramatically up
      public benchmarks. A decent model with a great harness beats a great model
      with a bad one.
  - q: What are the layers of an agent harness?
    a: >-
      Around the central observe-plan-act-verify loop sit six concerns: context
      (what the model sees each step), tools (how it acts on the world), memory
      (what persists between sessions), sandbox (where actions run safely),
      permissions (what it is allowed to do), and observability (a record of
      what happened).
---

> **Agent = Model + Harness.** If you are not the model, you are the harness.

If you have used an AI coding tool or an "AI agent" recently and wondered what
the difference is between _that_ and just chatting with a model, this post is for
you. The answer has a name now: **the harness**. And the practice of building a
good one is called **harness engineering**.

No prior background needed. We will build the idea up from scratch.

## What is a harness? The one-sentence version

A **harness** is all the engineering wrapped _around_ an AI model that turns a
raw text generator into something that can reliably get real work done.

Here is the whole idea in one picture:

![A raw model turns text in into just words; a model plus harness turns tools, memory, checks and limits into a finished task.](/assets/blog/harness-engineering-diagram-1.svg)

A useful analogy: **the model is an engine, and the harness is the rest of the
car.** A powerful engine sitting on the garage floor does nothing. The
transmission, steering, brakes, fuel system, and dashboard are what turn raw
horsepower into "I arrived where I wanted to go, safely." The harness is all of
that, for an AI model.

## Why a raw AI model is not enough on its own

A large language model on its own is impressive but oddly helpless. Think of it
as a brilliant expert with four specific handicaps:

- **It forgets everything.** Every new conversation starts from a blank slate.
  It does not remember what you told it yesterday, or even what happened earlier
  in a long task, unless something feeds that back in.
- **It cannot actually _do_ anything.** It produces text. It cannot run code,
  open a file, search the web, or send an email by itself. It can only describe
  what it _would_ do.
- **It cannot reliably check its own work.** Ask it for an answer and it will
  give you one with confidence, whether or not it is correct.
- **It cannot stop itself.** Left alone in a loop, it can happily retry the same
  broken thing forever, or quietly expand a small task into a huge one.

A raw model is like a world-class chef locked in a room with no ingredients, no
stove, no memory of the order, and no way to taste the dish. Enormous skill,
zero output. The harness hands them the kitchen.

## The heart of a harness: the agent loop

Everything in a harness exists to support one central thing: **a loop**.

A person doing a real task naturally works in a cycle. Look at the situation,
decide the next step, do it, check whether it worked, then repeat until done. An
agent works the same way. This is the engine room of every harness:

![The agent loop: observe the current state, plan the next step, act by running a tool or editing a file, verify whether it worked, and repeat until done.](/assets/blog/harness-engineering-diagram-2.svg)

The model is the part that does the **planning**. The harness drives the loop
around it: it gathers what the model should observe, executes the action the
model chose, runs the check, and decides whether to go around again.

Two things this loop _must_ get right, because they are where most real-world
agents break:

1. **Stop when appropriate.** No retrying forever. No quietly turning "fix this
   typo" into "rewrite the whole app."
2. **Be able to verify or admit defeat.** A good agent checks its work or says
   "I could not do this," instead of confidently handing back something wrong.

## The layers of a harness, around the loop

The loop is the heart. Wrapped around it are a handful of supporting layers,
each solving one of the model's handicaps. Here is how they stack up:

![The layers of a harness around the model: the loop, then context, tools, memory, sandbox, permissions and observability.](/assets/blog/harness-engineering-diagram-3.svg)

Here is each layer in plain language, and the simple test of whether you need it:
_what breaks if it is missing?_

| Layer             | What it does                                                    | What breaks without it                                                       |
| ----------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Context**       | Decides what information to put in front of the model each step | The model is either starved of facts it needs, or buried in irrelevant noise |
| **Tools**         | Lets the model run code, search, call an API, edit a file       | The model can only talk about doing things, never do them                    |
| **Memory**        | Saves state so the next session is not blind                    | Every session starts from zero and repeats work                              |
| **Sandbox**       | An isolated space where actions run safely                      | A mistake can damage real systems or leak data                               |
| **Permissions**   | Defines and enforces what the agent may and may not do          | The agent can take actions it should never have been allowed to              |
| **Observability** | Records traces, costs, and failures                             | When something breaks, nobody can tell what happened or why                  |

A nice mental shortcut: **context** is what goes _in_, **tools** are how it acts
_out_, **memory** is what _stays_, and **sandbox, permissions, and
observability** are the safety rails that make the whole thing trustworthy.

Context and memory are the layers most teams underinvest in. If you want to go
deeper on the "what goes in" side, see
[Get Organized for AI](/blog/organized-for-ai/), which is really a story about
context and memory at human scale.

## A worked example: "the checkout test is failing, fix it"

Abstract layers are easy to forget. Let us watch them all work together on a real
task. Imagine you tell a coding agent:

> "The checkout test is failing. Please fix it."

Here is what happens behind the scenes, layer by layer:

![A sequence of one task: you ask the harness to fix a failing test; it shows the model the code, runs the test in the sandbox, feeds the error back, applies the edit, re-runs the tests and reports what changed.](/assets/blog/harness-engineering-diagram-4.svg)

Notice that the model never touched your computer directly. It only ever
_decided what to do next_. Every real action (running the test, reading the
error, editing the file) went through the harness:

- **Context** chose which files were worth showing the model, so it was not
  drowning in your whole codebase.
- **Tools** gave it the ability to run the test and edit a file.
- **The sandbox** ran that code in an isolated space, so a bad edit could not
  break anything important.
- **Permissions** allowed "run the test suite" but would have blocked something
  like "delete the production database."
- **Verify** in the loop is what caught success: the agent confirmed the test
  was green before declaring victory.
- **Observability** quietly logged every step, so if it had gone wrong, you
  could see exactly where.

Swap the coding agent for a research assistant or a customer-support agent and
the shape is identical. Only the tools change.

## Why harness engineering matters more than people expect

Here is the part that surprises most people. The gap between what an AI model
_can_ do and what you actually see it do is, more often than not, a **harness
problem, not a model problem**.

A widely-cited experiment from the team at LangChain made this concrete. They
took the _same model_ and only changed the harness around it. That single change
moved a coding agent from roughly rank 30 to rank 5 on a public benchmark. Same
brain, very different results, purely because of the machinery around it.

Treat any single benchmark with a pinch of salt, but the direction holds across
the field:

> A decent model with a great harness beats a great model with a bad one.

This is why "harness engineering" became a job worth naming. As models get more
interchangeable, the durable craft is increasingly in the harness. It is the same
reason we build [agent-native products](/blog/shipping-agent-native-blog/)
rather than bolting a chat box onto an existing app.

## The catch: the layers are not really separate boxes

One honest warning, so you do not walk away with a too-tidy picture.

The clean diagram above is a teaching tool, not an architecture you can build one
box at a time. In real systems, these layers leak into each other constantly:

- **Context and memory** blur together: what you remember is part of what you
  show the model.
- **Verification only works if observability** is already capturing the right
  information.
- **Permissions are meaningless without a real sandbox** to enforce them.

So treat the layers as a **checklist of concerns you must handle**, not as
finished components you can tick off. The moment a team says "we have a memory
layer, that is done," is usually the moment things start getting brittle.

## TL;DR

- A **model** on its own just produces text. It forgets, cannot act, cannot
  check itself, and cannot stop itself.
- A **harness** is everything wrapped around the model that fixes those gaps.
  **Agent = Model + Harness.**
- At its heart is a **loop**: observe, plan, act, verify, repeat until done.
- Around the loop sit a few layers: **context, tools, memory, sandbox,
  permissions, observability.**
- The harness often matters _more_ than the model. A great harness with an okay
  model beats the reverse.
- The layers are concerns to handle, not clean boxes. In real systems they
  overlap, and pretending they do not is where things break.

If you remember one line, make it this one: **the model is the engine, and the
harness is the rest of the car.**
