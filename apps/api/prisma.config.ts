import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma generate does not require a live database URL, so keep this
    // optional for CI/type-check jobs that do not provision Postgres.
    url: process.env.DATABASE_URL ?? "",
  },
});
