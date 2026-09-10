import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Monorepo: point tracing at the workspace root so the shared package
  // (linked via npm workspaces) resolves correctly and to silence the
  // multi-lockfile root inference warning.
  outputFileTracingRoot: path.join(__dirname, ".."),
  // Dev-only on-screen indicator (not shipped in production). Move it out of
  // the way of the centered page content on narrow viewports.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
