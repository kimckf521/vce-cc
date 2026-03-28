

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  experimental: {
    // Tree-shake lucide-react (60+ icons imported) — massive bundle size reduction
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
