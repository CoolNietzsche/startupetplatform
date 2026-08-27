import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
 
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment!");
}
 
const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });
};
 
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}
 
export const db = globalThis.prisma || prismaClientSingleton();
 
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
 
export default db;
