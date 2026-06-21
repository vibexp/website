import {
  escapeJsonLd,
  organizationSchema,
  softwareApplicationSchema,
} from '../../src/lib/structuredData'

describe('escapeJsonLd', () => {
  it('escapes <, > and & so the payload cannot break out of a <script>', () => {
    const out = escapeJsonLd({ a: '<script>alert(1)</script> & more' })
    expect(out).toContain('\\u003c')
    expect(out).toContain('\\u003e')
    expect(out).toContain('\\u0026')
    // No raw HTML-significant characters survive in the serialized output.
    expect(out).not.toMatch(/[<>&]/)
  })

  it('escapes the U+2028 / U+2029 line/paragraph separators', () => {
    const LS = String.fromCharCode(0x2028)
    const PS = String.fromCharCode(0x2029)
    const out = escapeJsonLd({ a: `line${LS}para${PS}end` })
    // The raw separators must not survive (they would break a <script>).
    expect(out).not.toContain(LS)
    expect(out).not.toContain(PS)
    // They are replaced by their \uXXXX escape sequences.
    expect(out).toContain('u2028')
    expect(out).toContain('u2029')
  })

  it('still produces valid JSON that round-trips to the original value', () => {
    const value = { name: 'A & B <x>', nested: { sep: 'ab' } }
    expect(JSON.parse(escapeJsonLd(value))).toEqual(value)
  })
})

describe('structured-data schemas', () => {
  it('softwareApplicationSchema is a valid SoftwareApplication node', () => {
    expect(softwareApplicationSchema['@type']).toBe('SoftwareApplication')
    expect(softwareApplicationSchema['@context']).toBe('https://schema.org')
    expect(softwareApplicationSchema.url).toBe('https://vibexp.io')
    expect(softwareApplicationSchema.offers.price).toBe('0')
  })

  it('organizationSchema is a valid Organization node', () => {
    expect(organizationSchema['@type']).toBe('Organization')
    expect(organizationSchema.url).toBe('https://vibexp.io')
    expect(organizationSchema.sameAs).toContain('https://x.com/vibexp_io')
  })

  it('both schemas serialize cleanly through escapeJsonLd', () => {
    expect(() =>
      JSON.parse(escapeJsonLd(softwareApplicationSchema))
    ).not.toThrow()
    expect(() => JSON.parse(escapeJsonLd(organizationSchema))).not.toThrow()
  })
})
