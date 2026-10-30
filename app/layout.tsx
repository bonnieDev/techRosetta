import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import '@fontsource/ibm-plex-mono/latin-700.css'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@/styles/tokens.css'
import '@/styles/base.css'
import { ConsentBanner } from '@/components/ConsentBanner'
import { SiteAnalytics } from '@/components/SiteAnalytics'
import { consentRequired, gaBootstrap } from '@/lib/consent'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techrosetta.com'),
  title: 'Tech Rosetta',
  description: 'Understand it. Use it. Stay in control. A technology literacy field manual.',
  // holding page: stays out of search until the real site launches
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const country = (await headers()).get('x-vercel-ip-country')
  const required = consentRequired(country)
  const gaId = process.env.NEXT_PUBLIC_GA_ID ?? ''

  return (
    <html lang="en" dir="ltr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: gaBootstrap(gaId, required) }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <ConsentBanner required={required} />
        {children}
        <SiteAnalytics />
      </body>
    </html>
  )
}
