import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
