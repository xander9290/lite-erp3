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

const modelData: Prisma.ModelCreateInput[] = [
  {
    name: "[app] Aplicación",
    label: "app",
    description: "Aplicación",
    active: true,
    createdUid: "",

    ModelFields: {
      create: [
        {
          name: "[saleMenu] Ventas",
          label: "saleMenu",
          description: "Menú ventas",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[saleQuotsMenu] Ventas cotizaciones",
          label: "saleQuotsMenu",
          description: "Ventas cotizaciones",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[saleSalesMenu] Ventas órdenes",
          label: "saleSalesMenu",
          description: "Ventas órdenes",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[saleMenu] Menú ventas",
          label: "saleMenu",
          description: "Menú ventas",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[saleSettingsMenu] Ventas configuración",
          label: "saleSettingsMenu",
          description: "Ventas configuración",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[saleSettingsMenu] Ventas configuración",
          label: "saleSettingsMenu",
          description: "Ventas configuración",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[purchaseMenu] Menú compras",
          label: "purchaseMenu",
          description: "Menú compras",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[purchaseQuotsMenu] Compras cotizaciones",
          label: "purchaseQuotsMenu",
          description: "Compras cotizaciones",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[purchaseOrdersMenu] Compras órdenes",
          label: "purchaseOrdersMenu",
          description: "Compras órdenes",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[invoicingMenu] Menú facturación",
          label: "invoicingMenu",
          description: "Menú facturación",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[invoicingCustomersMenu] Facturación clientes",
          label: "invoicingCustomersMenu",
          description: "Facturación clientes",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[invoicingSuppliersMenu] Facturación proveedores",
          label: "invoicingSuppliersMenu",
          description: "Facturación proveedores",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[invoicingSettings] Facturación configuración",
          label: "invoicingSettings",
          description: "Facturación configuración",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[partnersMenu] Menú contactos",
          label: "partnersMenu",
          description: "Menú contactos",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[partnersCustomersMenu] Contactos clientes",
          label: "partnersCustomersMenu",
          description: "Contactos clientes",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[partnersSuppliersMenu] Contactos proveedores",
          label: "partnersSuppliersMenu",
          description: "Contactos proveedores",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[partnersInternalsMenu] Contactos internos",
          label: "partnersInternalsMenu",
          description: "Contactos internos",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[inventoryMenu] Menu inventario",
          label: "inventoryMenu",
          description: "Menu inventario",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[inventoryWarehousesMenu] Inventario almacenes",
          label: "inventoryWarehousesMenu",
          description: "Inventario almacenes",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[inventoryProductTemplate] Inventario productos",
          label: "inventoryProductTemplate",
          description: "Inventario productos",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[inventoryManufacturing] Inventario fabricación",
          label: "inventoryManufacturing",
          description: "Inventario fabricación",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[inventoryStockWarehouse] Inventario existencias",
          label: "inventoryStockWarehouse",
          description: "Inventario existencias",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[inventoryStockMove] Inventario traslados",
          label: "inventoryStockMove",
          description: "Inventario traslados",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[inventoryStockMoveLine] Inventario movimientos",
          label: "inventoryStockMoveLine",
          description: "Inventario movimientos",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[settingsMenu] Menú ajustes",
          label: "settingsMenu",
          description: "Menú ajustes",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[settingsUsersMenu] Ajustes usuarios",
          label: "settingsUsersMenu",
          description: "Ajustes usuarios",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[settingsGroupsMenu] Ajustes grupos",
          label: "settingsGroupsMenu",
          description: "Ajustes grupos",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[settingsCompaniesMenu] Ajustes empresas",
          label: "settingsCompaniesMenu",
          description: "Ajustes empresas",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[settingsModelsMenu] Ajustes modelos",
          label: "settingsModelsMenu",
          description: "Ajustes modelos",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
        {
          name: "[settingsFieldsMenu] Ajustes campos",
          label: "settingsFieldsMenu",
          description: "Ajustes campos",
          fieldType: "link",
          active: true,
          createdUid: "",
        },
      ],
    },
  },
];

export async function main() {
  const hashedPswd = await bcrypt.hash("Abcd1234#", 10);
  for (const u of userData) {
    await prisma.user.create({ data: { ...u, password: hashedPswd } });
  }

  for (const m of modelData) {
    await prisma.model.create({ data: { ...m } });
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
