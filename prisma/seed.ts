import { Prisma, PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    login: "admin",
    password: "Admin1234#",
    active: true,
    Partner: {
      create: {
        name: "Admin",
        email: "admin@correo.com",
      },
    },
  },
];

export async function main() {
  const hashedPswd = await bcrypt.hash("Admin1234#", 10);
  for (const u of userData) {
    await prisma.user.create({ data: { ...u, password: hashedPswd } });
  }
}

main();
