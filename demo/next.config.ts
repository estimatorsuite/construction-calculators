import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  basePath: "/construction-calculators",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default config;
