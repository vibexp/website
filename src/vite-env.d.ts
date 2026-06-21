/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RELEASE_SHA: string
  readonly VITE_RELEASE_DATE: string
  readonly VITE_WEBSITE_SENTRY_DSN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
