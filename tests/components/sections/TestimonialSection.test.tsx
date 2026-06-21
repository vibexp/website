import '@testing-library/jest-dom'

import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestimonialSection } from '../../../src/components/sections/TestimonialSection'

describe('TestimonialSection', () => {
  const testimonials = [
    {
      id: 1,
      name: 'Alice',
      title: 'Engineer',
      email: 'alice@example.com',
      content: 'Great product',
    },
    {
      id: 2,
      name: 'Bob',
      title: 'Designer',
      content: 'Love it',
    },
  ]

  it('renders the heading and the first testimonial', () => {
    render(
      <TestimonialSection
        heading="What users say"
        subheading="Real feedback"
        testimonials={testimonials}
      />
    )

    expect(
      screen.getByRole('heading', { name: /what users say/i, level: 2 })
    ).toBeInTheDocument()
    expect(screen.getByText('Real feedback')).toBeInTheDocument()
    expect(screen.getByText(/great product/i)).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('switches testimonials when a dot is clicked', async () => {
    render(<TestimonialSection heading="Heading" testimonials={testimonials} />)

    await userEvent.click(
      screen.getByRole('button', { name: /go to testimonial 2/i })
    )
    expect(screen.getByText(/love it/i)).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders nothing when there are no testimonials', () => {
    const { container } = render(
      <TestimonialSection heading="Heading" testimonials={[]} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('auto-rotates to the next testimonial after the interval', () => {
    jest.useFakeTimers()
    try {
      render(
        <TestimonialSection
          heading="Heading"
          testimonials={testimonials}
          autoRotateInterval={1000}
        />
      )

      expect(screen.getByText(/great product/i)).toBeInTheDocument()
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(screen.getByText(/love it/i)).toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
  })

  it('pauses auto-rotation while hovered', () => {
    jest.useFakeTimers()
    try {
      render(
        <TestimonialSection
          heading="Heading"
          testimonials={testimonials}
          autoRotateInterval={1000}
        />
      )

      const region = screen.getByTestId('testimonial-carousel')
      fireEvent.mouseEnter(region)
      act(() => {
        jest.advanceTimersByTime(2000)
      })
      // Still on the first testimonial because rotation is paused.
      expect(screen.getByText(/great product/i)).toBeInTheDocument()

      fireEvent.mouseLeave(region)
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      expect(screen.getByText(/love it/i)).toBeInTheDocument()
    } finally {
      jest.useRealTimers()
    }
  })
})
