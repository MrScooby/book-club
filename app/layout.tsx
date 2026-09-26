import type { Metadata, Viewport } from 'next'
import MuiProvider from '@/components/layout/MuiProvider'
import AppShell from '@/components/layout/AppShell'
import { getYears } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Book Club',
  description: '12 books challenge',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Book Club' }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#5d4037'
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const years = await getYears()
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <MuiProvider>
          <AppShell years={years}>{children}</AppShell>
        </MuiProvider>
      </body>
    </html>
  )
}
