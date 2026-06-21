import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'

import { HowItWorksSection } from '../../../src/components/sections/HowItWorksSection'

describe('HowItWorksSection', () => {
  const steps = [
    { title: 'Sign up', description: 'Create your account' },
    { title: 'Add prompts', description: 'Import or write prompts' },
    { title: 'Share', description: 'Collaborate with your team' },
  ]

  it('renders the heading and every step', () => {
    render(
      <HowItWorksSection
        heading="How it works"
        subheading="Three simple steps"
        steps={steps}
      />
    )

    expect(
      screen.getByRole('heading', { name: /how it works/i, level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByText('Three simple steps')).toBeInTheDocument()
    expect(screen.getByText('Sign up')).toBeInTheDocument()
    expect(screen.getByText('Import or write prompts')).toBeInTheDocument()
  })

  it('auto-numbers the steps in order', () => {
    render(<HowItWorksSection heading="Heading" steps={steps} />)

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('1')
    expect(items[1]).toHaveTextContent('2')
    expect(items[2]).toHaveTextContent('3')
  })

  it('keeps long unbreakable descriptions overflow-safe', () => {
    // Regression for #1344: a long unbreakable URL in a step description forced
    // the step card wider than a 375px viewport. The card must be allowed to
    // shrink (min-w-0) and the description must wrap (break-words).
    const longUrlStep = [
      {
        title: 'Server Setup',
        description:
          'Connect to https://connect.vibexp.io/mcp/v1/common using your API key.',
      },
    ]

    render(<HowItWorksSection heading="Heading" steps={longUrlStep} />)

    const description = screen.getByText(/connect\.vibexp\.io/i)
    expect(description).toHaveClass('break-words')

    // Locate the step card structurally rather than via a styling class: walk up
    // from the description to the block element that is the direct child of its
    // enclosing list item (the card beside the step-number column). Then assert
    // the regression guard — the card must be a shrinkable flex child (min-w-0
    // is the actual overflow fix; flex-1 lets it take the remaining row width).
    const listItem = description.closest('li')
    expect(listItem).not.toBeNull()

    let card = description.parentElement
    while (card && card.parentElement !== listItem) {
      card = card.parentElement
    }
    expect(card).not.toBeNull()
    expect(card).toHaveClass('min-w-0', 'flex-1')
  })
})
