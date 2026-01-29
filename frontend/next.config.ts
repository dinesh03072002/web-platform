import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // ✅ Fix Cross origin request warning in dev
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.1.34:3000",
  ],
};

export default nextConfig;
