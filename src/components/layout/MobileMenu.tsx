import { Github, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { openGitHubRepo } from '@/utils/github'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  trackCTAClick,
  trackEvent,
  trackNavClick,
  WEBSITE_EVENTS,
} from '@/utils/gtm'

// Real <a href> (crawlable + full-page nav); onClick records GTM and closes the
// sheet before the browser follows the link.
const NAV_ITEMS = [
  { label: 'Home', to: '/', testId: 'mobile-menu-home' },
  { label: 'Features', to: '/features', testId: 'mobile-menu-features' },
  {
    label: 'How it works',
    to: '/how-it-works',
    testId: 'mobile-menu-how-it-works',
  },
] as const

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      trackEvent(WEBSITE_EVENTS.MOBILE_MENU_OPEN, { location: 'header' })
    } else {
      trackEvent(WEBSITE_EVENTS.MOBILE_MENU_CLOSE, { location: 'mobile_menu' })
    }
    setOpen(next)
  }

  const handleRouteClick = (destination: string, linkText: string) => {
    trackNavClick(linkText, destination, 'mobile_menu')
    setOpen(false)
  }

  const handleGitHubClick = () => {
    trackCTAClick('mobile_menu', 'github_repo', 'github_repo')
    openGitHubRepo('mobile_menu')
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          data-testid="mobile-menu-button"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        hideClose
        data-testid="mobile-menu"
        className="w-80 max-w-[85vw] p-0"
        aria-label="Mobile navigation menu"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b p-6 text-left">
          <SheetTitle className="text-foreground">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation links and account actions
          </SheetDescription>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              data-testid="mobile-menu-close"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-6">
          {NAV_ITEMS.map(item => (
            <Button
              key={item.to}
              asChild
              variant="ghost"
              className="justify-start text-base font-medium"
            >
              <Link
                to={item.to}
                data-testid={item.testId}
                onClick={() => handleRouteClick(item.to, item.label)}
              >
                {item.label}
              </Link>
            </Button>
          ))}

          <Separator className="my-4" />

          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={handleGitHubClick}>
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
