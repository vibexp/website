import { cn, formatPrice } from '../../src/lib/utils'

describe('cn', () => {
  it('merges multiple class names into a single string', () => {
    expect(cn('px-2', 'py-1', 'text-sm')).toBe('px-2 py-1 text-sm')
  })

  it('dedupes conflicting Tailwind classes, keeping the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('resolves conflicting directional utilities via tailwind-merge', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('drops falsy inputs (clsx behavior)', () => {
    expect(cn('px-2', false, null, undefined, '', 'py-1')).toBe('px-2 py-1')
  })

  it('applies conditional classes from an object map', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })

  it('flattens array inputs', () => {
    expect(cn(['px-2', 'py-1'], 'text-sm')).toBe('px-2 py-1 text-sm')
  })

  it('returns an empty string when given no meaningful classes', () => {
    expect(cn(false, null, undefined, '')).toBe('')
  })
})

describe('formatPrice', () => {
  it('formats a zero amount without trailing zeros', () => {
    expect(formatPrice(0)).toBe('€0')
  })

  it('formats a free-plan euro amount', () => {
    expect(formatPrice(9.99, 'eur')).toBe('€9.99')
  })

  it('formats a paid-plan euro amount', () => {
    expect(formatPrice(19.99, 'eur')).toBe('€19.99')
  })

  it('formats a whole-euro amount without trailing zeros (team Starter: 1200 cents / 100)', () => {
    expect(formatPrice(12, 'eur')).toBe('€12')
  })

  it('defaults to euro when no currency is given', () => {
    expect(formatPrice(5)).toBe('€5')
  })

  it('rounds away floating-point noise from multiplied totals', () => {
    // e.g. a per-seat × seats total can carry float noise (19.99 * 3)
    expect(formatPrice(19.99 * 3, 'eur')).toBe('€59.97')
  })
})
