const os = require('os');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Move webpack cache outside OneDrive to prevent file-sync corruption
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: 'filesystem',
        cacheDirectory: path.join(os.tmpdir(), 'baw-next-webpack-cache'),
      };
    }
    return config;
  },
  reactStrictMode: false,
  // Allow images from external AI generation services
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.butterbase.dev' },
      { protocol: 'https', hostname: '**.seedance.ai' },
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
      // Zhipu CogView-3 generated image CDN
      { protocol: 'https', hostname: 'sfile.chatglm.cn' },
      { protocol: 'https', hostname: '**.chatglm.cn' },
      { protocol: 'https', hostname: '**.bigmodel.cn' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_BUTTERBASE_APP_ID: process.env.NEXT_PUBLIC_BUTTERBASE_APP_ID,
    NEXT_PUBLIC_BUTTERBASE_API_URL: process.env.NEXT_PUBLIC_BUTTERBASE_API_URL,
  },
};

module.exports = nextConfig;
