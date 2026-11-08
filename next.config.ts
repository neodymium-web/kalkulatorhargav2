import type { NextConfig } from 'next'
import { indexable } from './lib/seo'

const config: NextConfig = {
  turbopack: { root: __dirname },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://vercel.com; font-src 'self'; connect-src 'self' https://vercel.live; frame-src https://vercel.live" },
        ...(!indexable ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
      ],
    }]
  },
}

export default config
