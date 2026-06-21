import { Github } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { openGitHubRepo } from '@/utils/github'
import { trackCTAClick, trackNavClick } from '@/utils/gtm'

import { Container } from './Container'
import { MobileMenu } from './MobileMenu'

// Primary nav. Real <a href> (crawlable + full-page MPA navigation); the onClick
// only records the GTM nav event before the browser follows the link.
const NAV_ITEMS = [
  { label: 'Home', to: '/', testId: 'nav-home' },
  { label: 'Features', to: '/features', testId: 'nav-features' },
  { label: 'How it works', to: '/how-it-works', testId: 'nav-how-it-works' },
] as const

export function Header() {
  const handleGitHubClick = () => {
    trackCTAClick('header', 'github_repo', 'github_repo')
    openGitHubRepo('header')
  }

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 w-full border-b bg-background"
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            data-testid="logo-link"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <img src="/logo.svg" alt="VibeXP" className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">VibeXP</span>
          </Link>

          <nav
            data-testid="header-nav"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_ITEMS.map(item => (
              <Button key={item.to} asChild variant="ghost">
                <Link
                  to={item.to}
                  data-testid={item.testId}
                  onClick={() => trackNavClick(item.label, item.to, 'header')}
                >
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="hidden md:inline-flex"
              onClick={handleGitHubClick}
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  )
}
