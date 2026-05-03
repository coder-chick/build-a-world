/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.butterbase.dev' },
      { protocol: 'https', hostname: '**.seedance.ai' },
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
      { protocol: 'https', hostname: '**.aliyuncs.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_BUTTERBASE_APP_ID: process.env.NEXT_PUBLIC_BUTTERBASE_APP_ID,
    NEXT_PUBLIC_BUTTERBASE_API_URL: process.env.NEXT_PUBLIC_BUTTERBASE_API_URL,
  },
};

module.exports = nextConfig;
