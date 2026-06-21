// Required for jest-dom matcher *types* (toHaveAttribute, toHaveClass, …) under
// ts-jest — tests/setup.ts registers them at runtime but ts-jest's per-file
// program needs the import for the global type augmentation.
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from '../../src/lib/astro-router-shim'

// The shim turns react-router navigation into plain MPA navigation, so it drives
// window.location. jsdom fully locks `location` (non-configurable object with
// read-only assign/replace, navigating setter), so the string-path assign/replace
// can't be intercepted in a unit test — it's exercised as a smoke test. The
// spyable history delta path and history-backed location read are asserted fully.
afterEach(() => {
  jest.restoreAllMocks()
  window.history.replaceState({}, '', '/')
})

describe('useNavigate', () => {
  it('returns a navigate function that runs without throwing for a path', () => {
    const navigate = useNavigate()
    expect(typeof navigate).toBe('function')
    expect(() => navigate('/how-it-works')).not.toThrow()
    expect(() => navigate('/features', { replace: true })).not.toThrow()
  })

  it('delegates numeric (history-delta) navigation to history.go', () => {
    const go = jest.spyOn(window.history, 'go').mockImplementation(() => {})
    useNavigate()(-1)
    expect(go).toHaveBeenCalledWith(-1)
  })
})

describe('useLocation', () => {
  it('reflects the current window location', () => {
    window.history.replaceState({}, '', '/how-it-works?ref=x')
    expect(useLocation()).toMatchObject({
      pathname: '/how-it-works',
      search: '?ref=x',
    })
  })
})

describe('Link', () => {
  it('renders a real anchor with href from `to` and forwards extra props', () => {
    render(
      <Link to="/features" className="nav" data-testid="lnk" target="_blank">
        Features
      </Link>
    )
    const a = screen.getByTestId('lnk')
    expect(a.tagName).toBe('A')
    expect(a).toHaveAttribute('href', '/features')
    expect(a).toHaveAttribute('target', '_blank')
    expect(a).toHaveClass('nav')
    expect(a).toHaveTextContent('Features')
  })

  it('does not leak react-router-only props onto the DOM', () => {
    render(
      <Link to="/x" data-testid="lnk" replace state={{ a: 1 }} reloadDocument>
        x
      </Link>
    )
    const a = screen.getByTestId('lnk')
    expect(a).not.toHaveAttribute('replace')
    expect(a).not.toHaveAttribute('state')
    expect(a).not.toHaveAttribute('reloadDocument')
  })
})

describe('NavLink', () => {
  it('resolves a function className with isActive=false (static MPA shell)', () => {
    render(
      <NavLink
        to="/how-it-works"
        data-testid="nav"
        className={({ isActive }) => (isActive ? 'on' : 'off')}
      >
        How it works
      </NavLink>
    )
    const a = screen.getByTestId('nav')
    expect(a).toHaveAttribute('href', '/how-it-works')
    expect(a).toHaveClass('off')
  })
})

describe('Navigate', () => {
  it('renders nothing (side-effect-only redirect) without throwing', () => {
    let container: HTMLElement
    expect(() => {
      ;({ container } = render(<Navigate to="/home" />))
    }).not.toThrow()
    expect(container!).toBeEmptyDOMElement()
  })
})

describe('Routes / Route passthrough', () => {
  it('renders a Route element through Routes (islands own no routing)', () => {
    render(
      <Routes>
        <Route path="/" element={<span data-testid="el">hello</span>} />
      </Routes>
    )
    expect(screen.getByTestId('el')).toHaveTextContent('hello')
  })
})
