import { Github, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Separator } from '@/components/ui/separator'
import { openCookieSettings } from '@/utils/cookieConsent'
import { trackEvent, trackNavClick, WEBSITE_EVENTS } from '@/utils/gtm'

import { Container } from './Container'

const GITHUB_URL = 'https://github.com/vibexp/vibexp'
const X_URL = 'https://x.com/vibexp_io'

// Real <a href> footer links (crawlable) so every page links to every key page —
// this is the internal-linking backbone for SEO. The onClick only records GTM.
const PRODUCT_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'How it works', to: '/how-it-works' },
] as const

const FEATURE_LINKS = [
  { label: 'Prompts', to: '/features/prompts' },
  { label: 'Blueprints', to: '/features/blueprints' },
  { label: 'Memory', to: '/features/memory' },
  { label: 'MCP Integration', to: '/features/mcp-integration' },
  { label: 'Artifacts', to: '/features/artifacts' },
] as const

export function Footer() {
  const handleLinkClick = (destination: string, linkText: string) => {
    trackNavClick(linkText, destination, 'footer')
  }

  const handleCookieSettingsClick = () => {
    trackNavClick('Cookie Settings', '#cookie-settings', 'footer')
    openCookieSettings()
  }

  const handleSocialClick = (platform: string, url: string) => {
    trackEvent(WEBSITE_EVENTS.SOCIAL_LINK_CLICK, {
      platform,
      url,
      location: 'footer',
    })
  }

  return (
    <footer
      data-testid="site-footer"
      className="border-t bg-muted text-muted-foreground"
    >
      <Container>
        <div className="grid gap-8 py-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link
              to="/"
              className="mb-4 flex w-fit items-center gap-2 transition-opacity hover:opacity-80"
            >
              <img src="/logo.svg" alt="VibeXP" className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">VibeXP</span>
            </Link>
            <p className="mb-6 max-w-md leading-relaxed">
              The shared knowledge base your AI builds on. Centralize your
              prompts, rules, and context so every AI tool reads from the same
              place and writes back what it learns.
            </p>
            <div className="flex gap-4">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
                aria-label="GitHub"
                onClick={() => handleSocialClick('github', GITHUB_URL)}
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
                aria-label="X (Twitter)"
                onClick={() => handleSocialClick('x', X_URL)}
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Product
            </h3>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="transition-colors hover:text-foreground"
                    onClick={() => handleLinkClick(item.to, item.label)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://blog.vibexp.io?utm_source=vibexp.io&utm_medium=footer&utm_campaign=blog_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                  onClick={() =>
                    handleLinkClick('https://blog.vibexp.io', 'Blog')
                  }
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Features
            </h3>
            <ul className="space-y-2">
              {FEATURE_LINKS.map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="transition-colors hover:text-foreground"
                    onClick={() => handleLinkClick(item.to, item.label)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Project
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={GITHUB_URL}
                  className="transition-colors hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick('github', GITHUB_URL)}
                >
                  GitHub
                </a>
              </li>
              <li>
                <button
                  onClick={handleCookieSettingsClick}
                  className="cursor-pointer text-left transition-colors hover:text-foreground"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <p className="text-sm">
            © {new Date().getFullYear()} VibeXP. Free and open source, from{' '}
            <a
              href="https://shaharialab.com?utm_source=vibexp.io&utm_medium=footer&utm_campaign=brand_link"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-foreground"
            >
              Shaharia Lab OÜ
            </a>
            .
          </p>
          <div className="flex gap-6">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-colors hover:text-foreground"
              onClick={() => handleSocialClick('github', GITHUB_URL)}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
