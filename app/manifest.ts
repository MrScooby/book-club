import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Book Club',
    short_name: 'Book Club',
    description: '12 books challenge',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#5d4037',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
  }
}
