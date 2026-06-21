/**
 * MPA-friendly `react-router-dom` replacement — used ONLY by the Astro build.
 *
 * Issue #1907 (phase 1): the marketing site is migrating from a Vite + React
 * SPA (BrowserRouter, client-side routing) to statically-generated Astro pages
 * (one real `.html` per route, full-page navigation). The existing React page
 * and chrome components (`Home`, `Header`, `Footer`, `MobileMenu`, `NotFound`,
 * …) import `react-router-dom` and call `useNavigate()` / render `<Link>`.
 *
 * When those components are server-rendered and hydrated as Astro islands there
 * is no `<Router>` ancestor, so the real `useNavigate()`/`<Link>` would throw an
 * invariant at render time. Astro's config aliases `react-router-dom` to this
 * module (see `astro.config.mjs`), so inside the Astro build every router import
 * resolves here instead — with no edits to the shared components. The Vite SPA
 * build keeps the real `react-router-dom`.
 *
 * The shim turns client-side routing into plain MPA navigation: `useNavigate()`
 * returns a function that sets `window.location`, and `<Link>` renders a real
 * `<a href>`. Both are SSR-safe (no `window` access at module/render time).
 */
import {
  createElement,
  forwardRef,
  Fragment,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from 'react'

type To = string | number

/** Full-page navigation in place of the SPA's history.push. */
export function useNavigate() {
  return (to: To, _options?: { replace?: boolean; state?: unknown }) => {
    if (typeof window === 'undefined') return
    if (typeof to === 'number') {
      window.history.go(to)
      return
    }
    if (_options?.replace) {
      window.location.replace(to)
    } else {
      window.location.assign(to)
    }
  }
}

export function useLocation() {
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '/'
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  return { pathname, search, hash, state: null, key: 'default' }
}

export function useParams<T extends Record<string, string | undefined>>(): T {
  return {} as T
}

export function useSearchParams(): [URLSearchParams, (next: unknown) => void] {
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )
  return [params, () => {}]
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string
  // react-router-only props — accepted then dropped so they never reach the DOM.
  replace?: boolean
  state?: unknown
  reloadDocument?: boolean
  preventScrollReset?: boolean
  relative?: string
  end?: boolean
}

/** Renders a real anchor so navigation is a normal full-page load. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    to,
    replace: _replace,
    state: _state,
    reloadDocument: _reloadDocument,
    preventScrollReset: _preventScrollReset,
    relative: _relative,
    end: _end,
    children,
    ...rest
  },
  ref
) {
  return createElement('a', { href: to, ref, ...rest }, children)
})

type NavLinkProps = Omit<LinkProps, 'className' | 'style'> & {
  className?: string | ((props: { isActive: boolean }) => string)
  style?: CSSProperties
  children?: ReactNode | ((props: { isActive: boolean }) => ReactNode)
}

/** Same as Link; active state is always false in a static MPA shell. */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink({ to, className, style, children, ...rest }, ref) {
    const resolvedClass =
      typeof className === 'function'
        ? className({ isActive: false })
        : className
    const resolvedChildren =
      typeof children === 'function' ? children({ isActive: false }) : children
    return createElement(
      'a',
      { href: to, ref, className: resolvedClass, style, ...rest },
      resolvedChildren
    )
  }
)

/** Declarative redirect → immediate full-page navigation on the client. */
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  if (typeof window !== 'undefined') {
    if (replace) window.location.replace(to)
    else window.location.assign(to)
  }
  return null
}

// Router container/route components are no-ops in the island model: Astro owns
// routing, and each page renders its content directly (never through <Routes>).
// They pass children through so any stray usage still renders.
export function BrowserRouter({ children }: { children?: ReactNode }) {
  return createElement(Fragment, null, children)
}
export const MemoryRouter = BrowserRouter
export const HashRouter = BrowserRouter
export function Routes({ children }: { children?: ReactNode }) {
  return createElement(Fragment, null, children)
}
export function Route({
  element,
}: {
  element?: ReactNode
  path?: string
  index?: boolean
  children?: ReactNode
}) {
  return element ?? null
}
export function Outlet() {
  return null
}

export default {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Link,
  NavLink,
  Navigate,
  BrowserRouter,
  MemoryRouter,
  HashRouter,
  Routes,
  Route,
  Outlet,
}
