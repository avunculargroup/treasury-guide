import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@mastra/core', '@mastra/ai-sdk'],
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.js',
    },
  },
};

export default nextConfig;
