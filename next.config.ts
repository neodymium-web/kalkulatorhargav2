import type { NextConfig } from 'next'
import { indexable } from './lib/seo'

const config: NextConfig = {
  turbopack: { root: __dirname },
  async headers() {
    return indexable ? [] : [{
      source: '/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }]
  },
}

export default config
