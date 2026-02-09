import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "", // 👈 antes iba en el schema, ahora aquí
  },
});
