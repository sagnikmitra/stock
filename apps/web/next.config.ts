import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ibo/db", "@ibo/types", "@ibo/strategy-engine"],
};

export default nextConfig;
