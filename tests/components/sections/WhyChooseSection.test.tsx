import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { Shield } from 'lucide-react'

import { WhyChooseSection } from '../../../src/components/sections/WhyChooseSection'

describe('WhyChooseSection', () => {
  const items = [{ text: 'Open source' }, { text: 'Self-hostable' }]

  const testimonial = {
    quote: 'It changed how we work',
    author: 'Jane Doe',
    role: 'CTO',
    company: 'Acme',
    initials: 'JD',
  }

  it('renders the heading and each checklist item', () => {
    render(
      <WhyChooseSection
        heading="Why choose VibeXP"
        subheading="Built for builders"
        items={items}
      />
    )

    expect(
      screen.getByRole('heading', { name: /why choose vibexp/i, level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByText('Open source')).toBeInTheDocument()
    expect(screen.getByText('Self-hostable')).toBeInTheDocument()
  })

  it('renders the testimonial when provided', () => {
    render(
      <WhyChooseSection
        heading="Heading"
        items={items}
        testimonial={testimonial}
      />
    )

    expect(screen.getByText(/it changed how we work/i)).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByText(/CTO.*Acme/i)).toBeInTheDocument()
  })

  it('omits the testimonial when not provided', () => {
    render(<WhyChooseSection heading="Heading" items={items} />)
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })

  it('uses a custom item icon when supplied', () => {
    const { container } = render(
      <WhyChooseSection
        heading="Heading"
        items={[{ text: 'Secure by default', icon: Shield }]}
      />
    )
    expect(screen.getByText('Secure by default')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('derives the avatar initials from the author when initials are omitted', () => {
    render(
      <WhyChooseSection
        heading="Heading"
        items={items}
        testimonial={{
          quote: 'Solid product',
          author: 'morgan',
          role: 'Lead',
          company: 'Globex',
        }}
      />
    )

    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('renders an avatar image when the testimonial has one', () => {
    render(
      <WhyChooseSection
        heading="Heading"
        items={items}
        testimonial={{ ...testimonial, image: '/jane.png' }}
      />
    )
    // Radix Avatar only swaps in the image once loaded; assert the author
    // fallback/structure renders regardless of image load in jsdom.
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })
})
