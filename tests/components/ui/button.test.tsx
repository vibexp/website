// Required for jest-dom matcher *types* (toBeInTheDocument, etc.) to resolve
// under ts-jest. tests/setup.ts registers them at runtime, but ts-jest's
// glob-based program does not reliably apply that global type augmentation to
// every file — do not remove this import or type-check breaks here.
import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button, buttonVariants } from '../../../src/components/ui/button'

describe('Button (shadcn)', () => {
  it('renders as a native button with its label', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire click handlers when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('forwards a ref to the underlying button element', () => {
    const ref = { current: null as HTMLButtonElement | null }
    render(<Button ref={ref}>Ref</Button>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('renders as a child element (link) when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/features">Go to features</a>
      </Button>
    )

    const link = screen.getByRole('link', { name: 'Go to features' })
    expect(link).toHaveAttribute('href', '/features')
    // asChild merges the cva classes onto the child, so the link carries them.
    expect(link).toHaveClass(...buttonVariants().split(' '))
  })

  it('merges a custom className with the cva output', () => {
    render(<Button className="custom-class">Styled</Button>)

    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  describe.each([
    ['default', 'bg-primary'],
    ['destructive', 'bg-destructive'],
    ['outline', 'border-input'],
    ['secondary', 'bg-secondary'],
    ['ghost', 'hover:bg-accent'],
    ['link', 'underline-offset-4'],
  ] as const)('variant "%s"', (variant, expectedClass) => {
    it(`applies the ${variant} variant class`, () => {
      render(<Button variant={variant}>Variant</Button>)

      expect(screen.getByRole('button')).toHaveClass(expectedClass)
    })

    it(`exposes the ${variant} variant via buttonVariants()`, () => {
      expect(buttonVariants({ variant })).toContain(expectedClass)
    })
  })

  describe.each([
    ['default', 'px-4'],
    ['sm', 'h-9'],
    ['lg', 'h-11'],
    ['icon', 'w-10'],
  ] as const)('size "%s"', (size, expectedClass) => {
    it(`applies the ${size} size class`, () => {
      render(<Button size={size}>Size</Button>)

      expect(screen.getByRole('button')).toHaveClass(expectedClass)
    })

    it(`exposes the ${size} size via buttonVariants()`, () => {
      expect(buttonVariants({ size })).toContain(expectedClass)
    })
  })

  it('falls back to default variant and size when none are supplied', () => {
    render(<Button>Default</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
    expect(button).toHaveClass('h-10')
  })
})
