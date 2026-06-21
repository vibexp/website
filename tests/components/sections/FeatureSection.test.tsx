import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { Zap } from 'lucide-react'

import { FeatureSection } from '../../../src/components/sections/FeatureSection'

describe('FeatureSection', () => {
  const features = [
    { title: 'Fast', description: 'Built for speed', icon: Zap },
    { title: 'Simple', description: 'Easy to use' },
  ]

  it('renders the heading and each feature', () => {
    render(
      <FeatureSection
        heading="What is VibeXP"
        description="A prompt platform"
        features={features}
      />
    )

    expect(
      screen.getByRole('heading', { name: /what is vibexp/i, level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByText('Fast')).toBeInTheDocument()
    expect(screen.getByText('Built for speed')).toBeInTheDocument()
    expect(screen.getByText('Simple')).toBeInTheDocument()
  })

  it('renders multiple description paragraphs from an array', () => {
    render(
      <FeatureSection
        heading="Heading"
        description={['First paragraph', 'Second paragraph']}
        features={features}
      />
    )

    expect(screen.getByText('First paragraph')).toBeInTheDocument()
    expect(screen.getByText('Second paragraph')).toBeInTheDocument()
  })

  it('renders without a description', () => {
    render(<FeatureSection heading="Heading" features={features} />)
    expect(screen.getByText('Fast')).toBeInTheDocument()
  })
})
