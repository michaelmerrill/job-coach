import { drizzle } from "drizzle-orm/neon-http";
import "@/utils/env";

export const db = drizzle(process.env.DATABASE_URL!);
