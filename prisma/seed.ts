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
    name: "bot",
    login: "bot",
    password: "",
    active: true,
    createdUid: "",
    Partner: {
      create: {
        name: "bot",
        email: "",
        createdUid: "",
      },
    },
  },
];

export async function main() {
  const hashedPswd = await bcrypt.hash("Abcd1234#", 10);
  for (const u of userData) {
    await prisma.user.create({ data: { ...u, password: hashedPswd } });
  }
}

main();
