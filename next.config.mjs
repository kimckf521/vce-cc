

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
  // URL migration history — all old shapes redirect to the canonical
  // /[curriculum]/[subject]/... URLs introduced in B2. Permanent (308)
  // redirects preserve Google rankings — treated same as 301 for SEO.
  //
  // Two waves of legacy URLs:
  //   1. Original single-subject flat URLs (`/topics`, `/exams`, ...) — from
  //      before any subject prefix existed.
  //   2. B1 combined-slug URLs (`/vce-methods/*`, `/vce-specialist/*`, ...) —
  //      from the interim phase before curriculum-prefixed routing landed.
  redirects: async () => [
    // Wave 1: flat → /vce/methods/* (Methods was the only subject back then)
    { source: "/topics", destination: "/vce/methods/topics", permanent: true },
    { source: "/topics/:path*", destination: "/vce/methods/topics/:path*", permanent: true },
    { source: "/exams", destination: "/vce/methods/exams", permanent: true },
    { source: "/exams/:path*", destination: "/vce/methods/exams/:path*", permanent: true },
    { source: "/practice", destination: "/vce/methods/practice", permanent: true },
    { source: "/practice/:path*", destination: "/vce/methods/practice/:path*", permanent: true },
    { source: "/questions/:path*", destination: "/vce/methods/questions/:path*", permanent: true },

    // Wave 2: combined-slug → curriculum-prefixed (for all 4 maths subjects)
    { source: "/vce-methods", destination: "/vce/methods", permanent: true },
    { source: "/vce-methods/:path*", destination: "/vce/methods/:path*", permanent: true },
    { source: "/vce-specialist", destination: "/vce/specialist", permanent: true },
    { source: "/vce-specialist/:path*", destination: "/vce/specialist/:path*", permanent: true },
    { source: "/vce-foundation", destination: "/vce/foundation", permanent: true },
    { source: "/vce-foundation/:path*", destination: "/vce/foundation/:path*", permanent: true },
    { source: "/vce-general", destination: "/vce/general", permanent: true },
    { source: "/vce-general/:path*", destination: "/vce/general/:path*", permanent: true },
  ],
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
};

export default nextConfig;
