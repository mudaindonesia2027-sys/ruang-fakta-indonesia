import { PrismaClient } from "@prisma/client";

const globalForDatabase = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseClient =
  globalForDatabase.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.prisma = databaseClient;
}

/**
 * Mendukung:
 *
 * import { db } from "@/lib/db"
 * import { prisma } from "@/lib/db"
 * import db from "@/lib/db"
 * import prisma from "@/lib/db"
 */
export const db = databaseClient;

export const prisma = databaseClient;

export default databaseClient;
