/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Lets a dev server use its own build dir (NEXT_DIST_DIR=.next-dev npm run dev)
  // so a concurrent `next build` can't wipe the running server's chunks.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
