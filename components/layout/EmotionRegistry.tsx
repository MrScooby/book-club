'use client'

import { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const c = createCache({ key: 'mui' })
    c.compat = true
    return c
  })

  useServerInsertedHTML(() => {
    const entries = Object.entries(cache.inserted)
    if (entries.length === 0) return null

    const names: string[] = []
    let styles = ''
    for (const [name, style] of entries) {
      if (typeof style === 'string') {
        names.push(name)
        styles += style
      }
    }

    return (
      <style
        key="emotion"
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}
