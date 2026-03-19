import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@prisma/client", "@prisma/client-runtime-utils"],

  serverExternalPackages: [
    "remotion",
    "@remotion/renderer",
    "@remotion/cli",
    "@remotion/bundler",
  ],
};

export default nextConfig;
