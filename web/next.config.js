const API_PROXY_TARGET = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000'
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts')

// TODO(sec): npm audit still flags Next.js SSR/cache issues that require upgrading to Next 16+.
//            Track GHSA-fr5h-rqp8-mj6g and related advisories once we can adopt the breaking release.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ]
  },
}

const config = withNextIntl(nextConfig)

if (config.env && config.env._next_intl_trailing_slash === undefined) {
  delete config.env._next_intl_trailing_slash
  if (Object.keys(config.env).length === 0) {
    delete config.env
  }
}

module.exports = config
