

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    // Serve modern formats for smaller image sizes
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Tree-shake heavy packages for smaller bundles on mobile
    optimizePackageImports: ["lucide-react", "react-markdown", "katex"],
  },
  // Compress responses for faster transfers
  compress: true,
  // Power HTTP headers for caching static assets on Vercel CDN
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
      ],
    },
  ],
};

export default nextConfig;
