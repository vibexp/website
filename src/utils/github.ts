// VibeXP is a free, open-source, self-hostable project. Every primary CTA on
// the marketing site points to the public GitHub repository instead of a hosted
// app. Build the repo URL with surface-scoped UTM params so we can attribute
// which CTA drove the click, then open it in a new tab.

export const GITHUB_REPO_URL = 'https://github.com/vibexp/vibexp'

/**
 * Builds the public repo URL with UTM params scoped to the CTA `surface`
 * (e.g. `header`, `hero`, `footer`, `sticky_cta`, `features_final`).
 */
export const buildGitHubUrl = (surface: string): string =>
  `${GITHUB_REPO_URL}?utm_source=website&utm_medium=${surface}&utm_campaign=github_repo&utm_content=github_repo`

/** Opens the public repo (UTM-tagged for `surface`) in a new tab. */
export const openGitHubRepo = (surface: string): void => {
  window.open(buildGitHubUrl(surface), '_blank', 'noopener,noreferrer')
}
