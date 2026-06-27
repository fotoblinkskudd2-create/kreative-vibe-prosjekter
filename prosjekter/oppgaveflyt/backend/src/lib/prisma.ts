import { PrismaClient } from "@prisma/client";

// Singleton: gjenbruk samme PrismaClient-instans gjennom appens livssyklus
// (unngår å åpne en ny connection pool per import under hot-reload i dev).
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
