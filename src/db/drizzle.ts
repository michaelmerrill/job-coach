import { drizzle } from "drizzle-orm/neon-http";
import "@/lib/env";

export const db = drizzle(process.env.DATABASE_URL!);
