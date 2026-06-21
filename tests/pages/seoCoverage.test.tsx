import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import type { JSX } from 'react'
import { MemoryRouter } from 'react-router-dom'

import {
  ArtifactsManagement,
  Blueprints,
  Features,
  Home,
  HowItWorks,
  McpIntegration,
  Memory,
  Prompts,
} from '@/pages'
import { defaultSEO, getPageSEO } from '@/utils/seo'

interface PageCase {
  name: string
  render: () => JSX.Element
  title: string
  description: string
  path: string
}

// For static-config pages we assert against getPageSEO(key) so the page and the
// SEO map can never silently diverge. HowItWorks uses an INLINE useSEO literal
// by design (it is NOT in getPageSEO), so its expected values are spelled out
// below — a future edit to the inline literal then fails this test.
const homeSeo = getPageSEO('home')
const featuresSeo = getPageSEO('features')
const promptSeo = getPageSEO('promptManagement')
const blueprintsSeo = getPageSEO('blueprints')
const memorySeo = getPageSEO('memoryManagement')
const mcpSeo = getPageSEO('mcpIntegration')
const artifactsSeo = getPageSEO('artifactsManagement')

const PAGES: PageCase[] = [
  {
    name: 'Home',
    render: () => <Home />,
    title: homeSeo.title,
    description: homeSeo.description,
    path: homeSeo.path,
  },
  {
    name: 'Features',
    render: () => <Features />,
    title: featuresSeo.title,
    description: featuresSeo.description,
    path: featuresSeo.path,
  },
  {
    name: 'Prompts',
    render: () => <Prompts />,
    title: promptSeo.title,
    description: promptSeo.description,
    path: promptSeo.path,
  },
  {
    name: 'Blueprints',
    render: () => <Blueprints />,
    title: blueprintsSeo.title,
    description: blueprintsSeo.description,
    path: blueprintsSeo.path,
  },
  {
    name: 'Memory',
    render: () => <Memory />,
    title: memorySeo.title,
    description: memorySeo.description,
    path: memorySeo.path,
  },
  {
    name: 'McpIntegration',
    render: () => <McpIntegration />,
    title: mcpSeo.title,
    description: mcpSeo.description,
    path: mcpSeo.path,
  },
  {
    name: 'ArtifactsManagement',
    render: () => <ArtifactsManagement />,
    title: artifactsSeo.title,
    description: artifactsSeo.description,
    path: artifactsSeo.path,
  },
  {
    // HowItWorks uses an INLINE useSEO literal by design (it is NOT in
    // getPageSEO); expected values are spelled out here so a future edit to the
    // inline literal fails this test.
    name: 'HowItWorks',
    render: () => <HowItWorks />,
    title: "How VibeXP Works - One Shared Brain for Your Team's AI | VibeXP",
    description:
      'See how VibeXP gives you and your team one shared brain that every AI tool plugs into. Your tools read and write your prompts, rules, memory, and artifacts over MCP. Connect in three steps. Free and open source.',
    path: '/how-it-works',
  },
]

describe('per-page SEO coverage (all kept routes)', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  it.each(PAGES)(
    '$name wires useSEO: title, description, canonical',
    async ({ render: renderPage, title, description, path }) => {
      render(renderPage(), { wrapper: MemoryRouter })

      expect(document.title).toBe(title)
      expect(
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute('content')
      ).toBe(description)
      expect(
        document.querySelector('link[rel="canonical"]')?.getAttribute('href')
      ).toBe(`${defaultSEO.baseUrl}${path}`)
    }
  )

  it.each(PAGES)(
    '$name renders exactly one <h1>',
    async ({ render: renderPage }) => {
      render(renderPage(), { wrapper: MemoryRouter })

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    }
  )

  it('removed routes are NOT in getPageSEO (fall back to home)', () => {
    // The contact/privacy/terms/pricing pages were removed; their keys must no
    // longer resolve and instead fall back to the home entry.
    ;['contact', 'privacy', 'terms', 'pricing'].forEach(key => {
      expect(getPageSEO(key)).toEqual(homeSeo)
    })
  })
})
