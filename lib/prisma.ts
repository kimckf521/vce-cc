import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Cache the Prisma client in ALL environments to avoid cold-start reconnections
// on Vercel serverless functions (each invocation reuses warm Lambda memory)
globalForPrisma.prisma = prisma;
