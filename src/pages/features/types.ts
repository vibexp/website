import type {
  Benefit,
  BenefitsSectionProps,
  CTASectionProps,
  FAQ,
  FeatureItem,
  FeatureSectionProps,
  HeroSectionProps,
  HowItWorksStep,
  Screenshot,
  Stat,
  WhyChooseItem,
  WhyChooseSectionProps,
} from '@/components/sections'

/**
 * Key into `getPageSEO` for a feature page. Constrained to the known feature
 * keys (all present in `src/utils/seo.ts`) so a typo is a compile error rather
 * than a silent fallback to the home page's title/description/canonical.
 */
export type FeatureSeoKey = 'mcpIntegration' | 'artifactsManagement'

/** Hero copy for a feature page (the template owns the media slot and actions). */
export interface FeatureHeroConfig {
  eyebrow?: HeroSectionProps['eyebrow']
  heading: HeroSectionProps['heading']
  subcopy?: HeroSectionProps['subcopy']
  /** Optional reassurance line beneath the hero actions. */
  reassurance?: HeroSectionProps['reassurance']
}

/** Stats band config (omit to skip the band). */
export interface FeatureStatsConfig {
  stats: Stat[]
  columnsClassName?: string
}

/** "What is" / feature-grid band config. */
export interface FeatureWhatIsConfig {
  heading: FeatureSectionProps['heading']
  description?: FeatureSectionProps['description']
  features: FeatureItem[]
  columnsClassName?: string
}

/** Screenshot/video carousel config (omit to skip the carousel). */
export interface FeatureScreenshotsConfig {
  /** Section heading rendered above the carousel. */
  heading: string
  /** Optional lead paragraph below the heading. */
  subheading?: string
  /** Optional helper line (e.g. "Hover to pause • Click to view larger"). */
  hint?: string
  screenshots: Screenshot[]
  autoPlayInterval?: number
  ariaLabel?: string
}

/** Benefits band config. */
export interface FeatureBenefitsConfig {
  heading: BenefitsSectionProps['heading']
  subheading?: BenefitsSectionProps['subheading']
  benefits: Benefit[]
  columnsClassName?: string
  popularLabel?: string
}

/** "How it works" band config. */
export interface FeatureHowItWorksConfig {
  heading: string
  subheading?: string
  steps: HowItWorksStep[]
}

/** "Why choose" checklist band config. */
export interface FeatureWhyChooseConfig {
  heading: WhyChooseSectionProps['heading']
  subheading?: WhyChooseSectionProps['subheading']
  items: WhyChooseItem[]
  testimonial?: WhyChooseSectionProps['testimonial']
  columnsClassName?: string
}

/** FAQ band config (omit to skip the band). */
export interface FeatureFaqConfig {
  heading: string
  subheading?: string
  faqs: FAQ[]
}

/** CTA band config. */
export interface FeatureCtaConfig {
  heading: CTASectionProps['heading']
  description?: CTASectionProps['description']
  /**
   * Campaign slug for the primary CTA's `cta_click` event. The template wires
   * the primary action so it opens the public GitHub repo and fires
   * `cta_click` with `location: 'feature_page_cta'` and `content: 'github_repo'`.
   */
  campaign: string
  primaryButtonText?: string
  /** Optional secondary action (rendered as an outline button). */
  secondaryAction?: CTASectionProps['secondaryAction']
}

/** Sticky CTA bar config (omit to skip the bar). */
export interface FeatureStickyCtaConfig {
  text: string
  mobileText: string
  buttonText?: string
  campaign: string
}

/**
 * An extra section appended after "Why choose" and before the FAQ. Pages whose
 * original copy has more blocks than the canonical nine sections (e.g. MCP's
 * "Getting Started") use these so every word is preserved without inventing new
 * visual patterns — each variant reuses an existing `@/components/sections`
 * primitive.
 */
export type FeatureExtraSection =
  | { kind: 'feature'; props: FeatureWhatIsConfig }
  | { kind: 'stats'; props: FeatureStatsConfig }
  | { kind: 'benefits'; props: FeatureBenefitsConfig }
  | { kind: 'whyChoose'; props: FeatureWhyChooseConfig }

/**
 * Complete, data-driven content for one feature page. Every section field is
 * optional except `seoKey`, `hero`, and `cta`; the template renders a band
 * only when its config is present.
 */
export interface FeaturePageConfig {
  /** Key into `getPageSEO` — drives title/description/canonical via `useSEO`. */
  seoKey: FeatureSeoKey
  hero: FeatureHeroConfig
  stats?: FeatureStatsConfig
  whatIs?: FeatureWhatIsConfig
  screenshots?: FeatureScreenshotsConfig
  benefits?: FeatureBenefitsConfig
  howItWorks?: FeatureHowItWorksConfig
  whyChoose?: FeatureWhyChooseConfig
  extraSections?: FeatureExtraSection[]
  faq?: FeatureFaqConfig
  cta: FeatureCtaConfig
  stickyCta?: FeatureStickyCtaConfig
}
