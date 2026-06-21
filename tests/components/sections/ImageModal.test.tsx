import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ImageModal } from '../../../src/components/sections/ImageModal'

describe('ImageModal', () => {
  it('renders the image and caption when open', () => {
    render(
      <ImageModal
        open
        onOpenChange={jest.fn()}
        imageSrc="/screenshot.png"
        imageAlt="Dashboard view"
      />
    )

    const image = screen.getByRole('img', { name: 'Dashboard view' })
    expect(image).toHaveAttribute('src', '/screenshot.png')
    // Caption + sr-only title both contain the alt text.
    expect(screen.getAllByText('Dashboard view').length).toBeGreaterThan(0)
  })

  it('does not render content when closed', () => {
    render(
      <ImageModal
        open={false}
        onOpenChange={jest.fn()}
        imageSrc="/screenshot.png"
        imageAlt="Dashboard view"
      />
    )

    expect(
      screen.queryByRole('img', { name: 'Dashboard view' })
    ).not.toBeInTheDocument()
  })

  it('calls onOpenChange when the close button is clicked', async () => {
    const onOpenChange = jest.fn()
    render(
      <ImageModal
        open
        onOpenChange={onOpenChange}
        imageSrc="/screenshot.png"
        imageAlt="Dashboard view"
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
