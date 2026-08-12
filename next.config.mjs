/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Directory-style export (out/fde/index.html) so GitHub Pages serves the
  // shareable routes with or without a trailing slash.
  trailingSlash: true,
  // Lets a dev server use its own build dir (NEXT_DIST_DIR=.next-dev npm run dev)
  // so a concurrent `next build` can't wipe the running server's chunks.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
