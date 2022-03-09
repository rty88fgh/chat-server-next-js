/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/chat",
        permanent: true
      }
    ]
  },
  experimental: {
    outputStandalone: true,
  },
}

module.exports = nextConfig
