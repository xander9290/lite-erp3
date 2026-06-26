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

// ejemplo para el model

// const modelData: Prisma.ModelCreateInput[] = [
//   {
//     name: "product",
//     label: "Producto",
//     description: "Modelo para administrar productos",
//     active: true,
//     createdUid: "",

//     ModelFields: {
//       create: [
//         {
//           name: "name",
//           label: "Nombre",
//           description: "Nombre del producto",
//           fieldType: "string",
//           active: true,
//           createdUid: "",
//         },
//         {
//           name: "price",
//           label: "Precio",
//           description: "Precio de venta del producto",
//           fieldType: "FLOAT",
//           active: true,
//           createdUid: "",
//         },
//         {
//           name: "active",
//           label: "Activo",
//           description: "Indica si el producto está activo",
//           fieldType: "BOOLEAN",
//           active: true,
//           createdUid: "",
//         },
//       ],
//     },
//   },
//   {
//     name: "partner",
//     label: "Contacto",
//     description: "Modelo para clientes y proveedores",
//     active: true,
//     createdUid: "",

//     ModelFields: {
//       create: [
//         {
//           name: "name",
//           label: "Nombre",
//           description: "Nombre del contacto",
//           fieldType: "STRING",
//           active: true,
//           createdUid: "",
//         },
//         {
//           name: "email",
//           label: "Correo",
//           description: "Correo electrónico del contacto",
//           fieldType: "STRING",
//           active: true,
//           createdUid: "",
//         },
//         {
//           name: "phone",
//           label: "Teléfono",
//           description: "Teléfono del contacto",
//           fieldType: "STRING",
//           active: true,
//           createdUid: "",
//         },
//       ],
//     },
//   },
// ];
