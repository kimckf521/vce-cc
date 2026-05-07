

const nextConfig = {
  // Hide the "x-powered-by: Next.js" response header (reduces fingerprinting)
  poweredByHeader: false,
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
  // Power HTTP headers for caching static assets on Vercel CDN + security
  headers: async () => [
    {
      // Apply to every route
      source: "/:path*",
      headers: [
        // Performance
        { key: "X-DNS-Prefetch-Control", value: "on" },
        // Security: prevent MIME type sniffing
        { key: "X-Content-Type-Options", value: "nosniff" },
        // Security: clickjacking protection (allow same-origin iframes only)
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        // Privacy: control how much referrer information is sent
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // Security: deny browser APIs we never use
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
        },
      ],
    },
  ],
  // Reduce serverless function size by excluding dev-only modules
  serverExternalPackages: [],
};

export default nextConfig;
