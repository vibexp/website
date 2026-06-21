import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FAQSection } from '../../../src/components/sections/FAQSection'

describe('FAQSection', () => {
  const faqs = [
    { q: 'Is there a free tier?', a: 'Yes, free forever.' },
    { q: 'Can I cancel anytime?', a: 'Absolutely.' },
  ]

  it('renders the heading and each question as an accordion trigger', () => {
    render(
      <FAQSection heading="FAQ" subheading="Common questions" faqs={faqs} />
    )

    expect(
      screen.getByRole('heading', { name: 'FAQ', level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByText('Common questions')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /is there a free tier/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /can i cancel anytime/i })
    ).toBeInTheDocument()
  })

  it('reveals the answer when a question is expanded', async () => {
    render(<FAQSection heading="FAQ" faqs={faqs} />)

    await userEvent.click(
      screen.getByRole('button', { name: /is there a free tier/i })
    )
    expect(await screen.findByText('Yes, free forever.')).toBeVisible()
  })
})
