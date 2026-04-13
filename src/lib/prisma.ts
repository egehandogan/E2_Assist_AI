import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

  // Turso/libSQL remote DB (libsql:// or https://)
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    const adapter = new PrismaLibSql({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  }

  // Local file-based SQLite (development only)
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  if (prismaInstance) return prismaInstance;

  prismaInstance = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
  return prismaInstance;
}

export const prisma = getPrisma();

// Helper: safely run DB operation with fallback
export async function dbSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error("[DB Error]", e instanceof Error ? e.message : e);
    return fallback;
  }
}
