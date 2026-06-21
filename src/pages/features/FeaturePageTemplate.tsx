import { useState } from 'react'

import { Container, Section } from '@/components/layout'
import {
  BenefitsSection,
  CTASection,
  FAQSection,
  FeatureSection,
  HeroSection,
  HowItWorksSection,
  ImageModal,
  ScreenshotCarousel,
  StatsGrid,
  StickyCTA,
  WhyChooseSection,
} from '@/components/sections'
import { useScrollTracking } from '@/hooks/useScrollTracking'
import { useSEO } from '@/hooks/useSEO'
import { cn } from '@/lib/utils'
import { openGitHubRepo } from '@/utils/github'
import { trackEvent } from '@/utils/gtm'
import { getPageSEO } from '@/utils/seo'

import { type FeatureExtraSection, type FeaturePageConfig } from './types'

export interface FeaturePageTemplateProps {
  config: FeaturePageConfig
}

function ExtraSection({ section }: { section: FeatureExtraSection }) {
  if (section.kind === 'stats') {
    return (
      <StatsGrid
        stats={section.props.stats}
        columnsClassName={section.props.columnsClassName}
      />
    )
  }
  if (section.kind === 'benefits') {
    return (
      <BenefitsSection
        heading={section.props.heading}
        subheading={section.props.subheading}
        benefits={section.props.benefits}
        columnsClassName={section.props.columnsClassName}
        popularLabel={section.props.popularLabel}
      />
    )
  }
  if (section.kind === 'whyChoose') {
    return (
      <WhyChooseSection
        heading={section.props.heading}
        subheading={section.props.subheading}
        items={section.props.items}
        testimonial={section.props.testimonial}
        columnsClassName={section.props.columnsClassName}
      />
    )
  }
  return (
    <FeatureSection
      heading={section.props.heading}
      description={section.props.description}
      features={section.props.features}
      columnsClassName={section.props.columnsClassName}
    />
  )
}

/**
 * FeaturePageTemplate renders a marketing feature page entirely from a typed
 * `FeaturePageConfig`. It composes the shared shadcn sections in a fixed order
 * and skips any band whose config is absent. All feature pages share the
 * global neutral `--primary` token — no per-feature accents or gradients.
 */
export function FeaturePageTemplate({ config }: FeaturePageTemplateProps) {
  const [modalImage, setModalImage] = useState<{
    src: string
    alt: string
  } | null>(null)

  // SEO. Page-view tracking (`feature_page_view`) is handled once at the App
  // level via usePageTracking(); calling it here would double-count.
  useSEO(getPageSEO(config.seoKey))
  useScrollTracking()

  // Opens the lightbox for a carousel screenshot and preserves the legacy
  // `image_zoom_click` event. `image_name` is the src basename, matching Home.tsx.
  const handleCarouselImageClick = (src: string, alt: string) => {
    const imageName = src.replace(/^.*\/|\.[^.]+$/g, '')
    trackEvent('image_zoom_click', {
      image_name: imageName,
      image_alt: alt,
      location: 'screenshot_carousel',
    })
    setModalImage({ src, alt })
  }

  // Opens the public GitHub repo. Fires `cta_click` with location
  // `feature_page_cta` and content `github_repo`.
  const handlePrimaryCta = () => {
    trackEvent('cta_click', {
      location: 'feature_page_cta',
      campaign: config.cta.campaign,
      content: 'github_repo',
    })
    openGitHubRepo('feature_page_cta')
  }

  return (
    <div className="bg-background">
      {config.stickyCta && (
        <StickyCTA
          text={config.stickyCta.text}
          mobileText={config.stickyCta.mobileText}
          buttonText={config.stickyCta.buttonText}
          campaign={config.stickyCta.campaign}
        />
      )}

      <HeroSection
        eyebrow={config.hero.eyebrow}
        heading={config.hero.heading}
        subcopy={config.hero.subcopy}
        reassurance={config.hero.reassurance}
        primaryAction={{
          label: config.cta.primaryButtonText ?? 'View on GitHub',
          onClick: handlePrimaryCta,
        }}
      />

      {config.stats && (
        <StatsGrid
          stats={config.stats.stats}
          columnsClassName={config.stats.columnsClassName}
        />
      )}

      {config.whatIs && (
        <FeatureSection
          heading={config.whatIs.heading}
          description={config.whatIs.description}
          features={config.whatIs.features}
          columnsClassName={config.whatIs.columnsClassName}
        />
      )}

      {config.screenshots && (
        <Section className="bg-muted">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="type-section">
                {config.screenshots.heading}
              </h2>
              {config.screenshots.subheading && (
                <p
                  className={cn(
                    'mt-4',
                    'type-lead'
                  )}
                >
                  {config.screenshots.subheading}
                </p>
              )}
              {config.screenshots.hint && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {config.screenshots.hint}
                </p>
              )}
            </div>
            <div className="mx-auto mt-12 max-w-4xl">
              <ScreenshotCarousel
                screenshots={config.screenshots.screenshots}
                autoPlayInterval={config.screenshots.autoPlayInterval}
                ariaLabel={config.screenshots.ariaLabel}
                onImageClick={handleCarouselImageClick}
              />
            </div>
          </Container>
        </Section>
      )}

      {config.benefits && (
        <BenefitsSection
          heading={config.benefits.heading}
          subheading={config.benefits.subheading}
          benefits={config.benefits.benefits}
          columnsClassName={config.benefits.columnsClassName}
          popularLabel={config.benefits.popularLabel}
        />
      )}

      {config.howItWorks && (
        <HowItWorksSection
          heading={config.howItWorks.heading}
          subheading={config.howItWorks.subheading}
          steps={config.howItWorks.steps}
        />
      )}

      {config.whyChoose && (
        <WhyChooseSection
          heading={config.whyChoose.heading}
          subheading={config.whyChoose.subheading}
          items={config.whyChoose.items}
          testimonial={config.whyChoose.testimonial}
          columnsClassName={config.whyChoose.columnsClassName}
        />
      )}

      {config.extraSections?.map((section, index) => (
        <ExtraSection key={`${section.kind}-${index}`} section={section} />
      ))}

      {config.faq && (
        <FAQSection
          heading={config.faq.heading}
          subheading={config.faq.subheading}
          faqs={config.faq.faqs}
        />
      )}

      <CTASection
        heading={config.cta.heading}
        description={config.cta.description}
        campaign={config.cta.campaign}
        primaryAction={{
          label: config.cta.primaryButtonText ?? 'View on GitHub',
          onClick: handlePrimaryCta,
        }}
        secondaryAction={config.cta.secondaryAction}
      />

      <ImageModal
        open={modalImage !== null}
        onOpenChange={open => {
          if (!open) setModalImage(null)
        }}
        imageSrc={modalImage?.src ?? ''}
        imageAlt={modalImage?.alt ?? ''}
      />
    </div>
  )
}
