import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Monorepo: point tracing at the workspace root so the shared package
  // (linked via npm workspaces) resolves correctly and to silence the
  // multi-lockfile root inference warning.
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
