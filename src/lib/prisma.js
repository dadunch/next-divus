// src/lib/prisma.js
import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton untuk Next.js
 * Optimized untuk serverless (Vercel) dengan connection pooling
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Logging configuration
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],

    // Connection pool optimization untuk Vercel
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Global singleton untuk development (hot reload safe)
const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma