"use client";

import { useMemo } from "react";
import Link from "next/link";
import { NavDropdown } from "react-bootstrap";
import { useAuth } from "@/hooks/sessionStore";
import styles from "./TopNavItems.module.css";

type MenuItem = {
  key: string;
  label: string;
  icon?: string;
  href?: string;
  dividerBefore?: boolean;
};

type MenuGroup = {
  key: string;
  label: string;
  icon: string;
  items: MenuItem[];
};

const menus: MenuGroup[] = [
  {
    key: "saleMenu",
    label: "Ventas",
    icon: "bi bi-graph-up",
    items: [
      {
        key: "saleQuotsMenu",
        label: "Cotizaciones",
        icon: "bi bi-file-earmark-plus",
        href: "/app/sale_order?view_type=list&id=null&state=draft",
      },
      {
        key: "saleSalesMenu",
        label: "Órdenes",
        icon: "bi bi-receipt",
        href: "/app/sale_order?view_type=list&id=null",
      },
      {
        key: "saleSettingsMenu",
        label: "Configuración",
        icon: "bi bi-gear-fill",
        href: "/app/sale_settings?view_type=list&id=null",
        dividerBefore: true,
      },
    ],
  },
  {
    key: "purchaseMenu",
    label: "Compras",
    icon: "bi bi-cart-plus-fill",
    items: [
      {
        key: "purchaseQuotsMenu",
        label: "Cotizaciones",
        icon: "bi bi-file-earmark-plus",
        href: "/app/purchase_order?view_type=list&id=null&state=draft",
      },
      {
        key: "purchaseOrdersMenu",
        label: "Compras",
        icon: "bi bi-bag-check",
        href: "/app/purchase_order?view_type=list&id=null",
      },
    ],
  },
  {
    key: "invoicingMenu",
    label: "Facturación",
    icon: "bi bi-file-earmark-text-fill",
    items: [
      {
        key: "invoicingCustomersMenu",
        label: "Clientes",
        icon: "bi bi-person-vcard-fill",
      },
      {
        key: "invoicingSuppliersMenu",
        label: "Proveedores",
        icon: "bi bi-building",
      },
      {
        key: "invoicingSettings",
        label: "Configuración",
        icon: "bi bi-gear-fill",
        href: "/app/invoicing_settings?view_type=list&id=null",
        dividerBefore: true,
      },
    ],
  },
  {
    key: "partnersMenu",
    label: "Contactos",
    icon: "bi bi-journal-bookmark-fill",
    items: [
      {
        key: "partnersCustomersMenu",
        label: "Clientes",
        icon: "bi bi-person-vcard-fill",
        href: "/app/partners?view_type=list&id=null&display=CUSTOMER",
      },
      {
        key: "partnersSuppliersMenu",
        label: "Proveedores",
        icon: "bi bi-building",
        href: "/app/partners?view_type=list&id=null&display=SUPPLIER",
      },
      {
        key: "partnersInternalsMenu",
        label: "Internos",
        icon: "bi bi-person-bounding-box",
        href: "/app/partners?view_type=list&id=null&display=INTERNAL",
      },
    ],
  },
  {
    key: "inventoryMenu",
    label: "Inventario",
    icon: "bi bi-table",
    items: [
      {
        key: "inventoryWarehousesMenu",
        label: "Almacenes",
        icon: "bi bi-grid-1x2-fill",
        href: "/app/warehouses?view_type=list&id=null",
      },
      {
        key: "inventoryProductTemplate",
        label: "Productos",
        icon: "bi bi-boxes",
        href: "/app/product_template?view_type=list&id=null",
      },
      {
        key: "inventoryManufacturing",
        label: "Fabricación",
        icon: "bi bi-flask",
        href: "/app/manufacturing?view_type=list&id=null",
      },
      {
        key: "inventoryStockWarehouse",
        label: "Existencias",
        icon: "bi bi-grid-3x3",
        href: "/app/stock_warehouse?view_type=list&id=null",
      },
      {
        key: "inventoryStockMove",
        label: "Traslados",
        icon: "bi bi-arrow-left-right",
      },
      {
        key: "inventoryStockMoveLine",
        label: "Movimientos",
        icon: "bi bi-list-columns",
        href: "/app/stock_move?view_type=list&id=null",
      },
    ],
  },
  {
    key: "settingsMenu",
    label: "Ajustes",
    icon: "bi bi-gear-fill",
    items: [
      {
        key: "settingsUsersMenu",
        label: "Usuarios",
        icon: "bi bi-person-fill",
        href: "/app/users?view_type=list&id=null",
      },
      {
        key: "settingsGroupsMenu",
        label: "Grupos",
        icon: "bi bi-people-fill",
        href: "/app/groups?view_type=list&id=null",
      },
      {
        key: "settingsCompaniesMenu",
        label: "Empresas",
        icon: "bi bi-buildings",
        href: "/app/companies?view_type=list&id=null",
      },
      {
        key: "settingsModelsMenu",
        label: "Modelos",
        icon: "bi bi-database-fill",
        href: "/app/models?view_type=list&id=null",
        dividerBefore: true,
      },
      {
        key: "settingsFieldsMenu",
        label: "Campos",
        icon: "bi bi-list-columns-reverse",
        href: "/app/model_fields?view_type=list&id=null",
      },
    ],
  },
];

function TopNavItems() {
  const { access } = useAuth();

  const accessMap = useMemo(() => {
    return new Map(
      access
        .filter((acc) => acc.entityType === "app")
        .map((acc) => [acc.fieldName, acc]),
    );
  }, [access]);

  const isInvisible = (fieldName: string) => {
    return accessMap.get(fieldName)?.invisible === true;
  };

  const visibleMenus = menus
    .filter((menu) => !isInvisible(menu.key))
    .map((menu) => ({
      ...menu,
      items: menu.items.filter((item) => !isInvisible(item.key)),
    }))
    .filter((menu) => menu.items.length > 0);

  return (
    <nav className={styles.navItems} aria-label="Módulos principales">
      {visibleMenus.map((menu) => (
        <NavDropdown
          key={menu.key}
          align="start"
          className={styles.navDropdown}
          menuVariant="light"
          title={
            <span className={styles.dropdownTitle}>
              <i className={`${menu.icon} ${styles.titleIcon}`} />
              <span>{menu.label}</span>
            </span>
          }
        >
          <div className={styles.menuHeader}>
            <i className={`${menu.icon} ${styles.menuHeaderIcon}`} />
            <span>{menu.label}</span>
          </div>

          {menu.items.map((item) => (
            <div key={item.key}>
              {item.dividerBefore && <NavDropdown.Divider />}

              {item.href ? (
                <NavDropdown.Item
                  as={Link}
                  href={item.href}
                  title={item.key}
                  className={styles.dropdownItem}
                >
                  {item.icon && (
                    <span className={styles.itemIcon}>
                      <i className={item.icon} />
                    </span>
                  )}

                  <span className={styles.itemLabel}>{item.label}</span>
                </NavDropdown.Item>
              ) : (
                <NavDropdown.Item
                  title={item.key}
                  disabled
                  className={styles.dropdownItem}
                >
                  {item.icon && (
                    <span className={styles.itemIcon}>
                      <i className={item.icon} />
                    </span>
                  )}

                  <span className={styles.itemLabel}>{item.label}</span>

                  <small className={styles.comingSoon}>Próx.</small>
                </NavDropdown.Item>
              )}
            </div>
          ))}
        </NavDropdown>
      ))}
    </nav>
  );
}

export default TopNavItems;
