"use client";

import { useAuth } from "@/hooks/sessionStore";
import Link from "next/link";
import { NavDropdown } from "react-bootstrap";

function TopNavItems() {
  const { access } = useAuth();
  const fieldsAccess = access.filter((acc) => acc.entityType === "app");
  return (
    <>
      <NavDropdown
        title={
          <>
            <i className="bi bi-graph-up me-1"></i>
            <span>Ventas</span>
          </>
        }
        disabled={
          fieldsAccess.find((field) => field.fieldName === "saleMenu")
            ?.invisible
        }
      >
        <NavDropdown.Item
          title="saleQuotsMenu"
          disabled={
            fieldsAccess.find((field) => field.fieldName === "saleQuotsMenu")
              ?.invisible
          }
        >
          Cotizaciones
        </NavDropdown.Item>
        <NavDropdown.Item
          title="saleSalesMenu"
          disabled={
            fieldsAccess.find((field) => field.fieldName === "saleSalesMenu")
              ?.invisible
          }
        >
          Órdenes
        </NavDropdown.Item>
      </NavDropdown>
      <NavDropdown
        title={
          <>
            <i className="bi bi-cart-plus-fill me-1"></i>
            <span>Compras</span>
          </>
        }
        disabled={
          fieldsAccess.find((field) => field.fieldName === "purchaseMenu")
            ?.invisible
        }
      >
        <NavDropdown.Item
          title="purchaseQuotsMenu"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "purchaseQuotsMenu",
            )?.invisible
          }
        >
          Cotizaciones
        </NavDropdown.Item>
        <NavDropdown.Item
          title="purchaseOrdersMenu"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "purchaseOrdersMenu",
            )?.invisible
          }
        >
          Compras
        </NavDropdown.Item>
      </NavDropdown>
      <NavDropdown
        title={
          <>
            <i className="bi bi-file-earmark-text-fill me-1"></i>
            <span>Facturación</span>
          </>
        }
        disabled={
          fieldsAccess.find((field) => field.fieldName === "invoicingMenu")
            ?.invisible
        }
      >
        <NavDropdown.Item
          title="invoicingCustomersMenu"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "invoicingCustomersMenu",
            )?.invisible
          }
        >
          <i className="bi bi-person-vcard-fill me-1"></i>
          <span>Clietes</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="invoicingSuppliersMenu"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "invoicingSuppliersMen",
            )?.invisible
          }
        >
          <i className="bi bi-building me-1"></i>
          <span>Proveedores</span>
        </NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
        title={
          <>
            <i className="bi bi-journal-bookmark-fill me-1"></i>
            <span>Contactos</span>
          </>
        }
        disabled={
          fieldsAccess.find((field) => field.fieldName === "partnersMenu")
            ?.invisible
        }
      >
        <NavDropdown.Item
          title="partnersCustomersMenu"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "partnersCustomersMenu",
            )?.invisible
          }
          as={Link}
          href="/app/partners?view_type=list&id=null&display=CUSTOMER"
        >
          <i className="bi bi-person-vcard-fill me-1"></i>
          <span>Clientes</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="partnersSuppliersMenu"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "partnersSuppliersMenu",
            )?.invisible
          }
          as={Link}
          href="/app/partners?view_type=list&id=null&display=SUPPLIER"
        >
          <i className="bi bi-building me-1"></i>
          <span>Proveedores</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="partnersInternalsMenu"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "partnersInternalsMenu",
            )?.invisible
          }
          as={Link}
          href="/app/partners?view_type=list&id=null&display=INTERNAL"
        >
          <i className="bi bi-person-bounding-box me-1"></i>
          <span>Internos</span>
        </NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
        title={
          <>
            <i className="bi bi-table me-1"></i>
            <span>Inventario</span>
          </>
        }
        disabled={
          fieldsAccess.find((field) => field.fieldName === "inventoryMenu")
            ?.invisible
        }
      >
        <NavDropdown.Item
          title="inventoryWarehousesMenu"
          href="/app/warehouses?view_type=list&id=null"
          as={Link}
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "inventoryWarehousesMenu",
            )?.invisible
          }
        >
          <i className="bi bi-grid-1x2-fill me-1"></i>
          <span>Almacenes</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="inventoryProductTemplate"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "inventoryProductTemplate",
            )?.invisible
          }
          href="/app/product_template?view_type=list&id=null"
          as={Link}
        >
          <i className="bi bi-boxes me-1"></i>
          <span>Productos</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="inventoryManufacturing"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "inventoryManufacturing",
            )?.invisible
          }
        >
          <i className="bi bi-flask me-1"></i>
          <span>Fabricación</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="inventoryStockWarehouse"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "inventoryStockWarehouse",
            )?.invisible
          }
        >
          <i className="bi bi-grid-3x3 me-1"></i>
          <span>Existencias</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="inventoryStockMove"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "inventoryStockMove",
            )?.invisible
          }
        >
          <i className="bi bi-arrow-left-right me-1"></i>
          <span>Traslados</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="inventoryStockMoveLine"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "inventoryStockMoveLine",
            )?.invisible
          }
        >
          <i className="bi bi-list-columns"></i> <span>Movimientos</span>
        </NavDropdown.Item>
      </NavDropdown>

      <NavDropdown
        title={
          <>
            <i className="bi bi-gear-fill me-1"></i>
            <span>Ajustes</span>
          </>
        }
        disabled={
          fieldsAccess.find((field) => field.fieldName === "settingsMenu")
            ?.invisible
        }
      >
        <NavDropdown.Item
          title="settingsUsersMenu"
          as={Link}
          href="/app/users?view_type=list&id=null"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "settingsUsersMenu",
            )?.invisible
          }
        >
          <i className="bi bi-person-fill me-1"></i>
          <span>Usuarios</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="settingsGroupsMenu"
          as={Link}
          href="/app/groups?view_type=list&id=null"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "settingsGroupsMenu",
            )?.invisible
          }
        >
          <i className="bi bi-people-fill me-1"></i>
          <span>Grupos</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="settingsCompaniesMenu"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "settingsCompaniesMenu",
            )?.invisible
          }
          as={Link}
          href="/app/companies?view_type=list&id=null"
        >
          <i className="bi bi-buildings me-1"></i>
          <span>Empresas</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="settingsModelsMenu"
          as={Link}
          href="/app/models?view_type=list&id=null"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "settingsModelsMenu",
            )?.invisible
          }
        >
          <i className="bi bi-database-fill me-1"></i>
          <span>Modelos</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="settingsFieldsMenu"
          as={Link}
          href="/app/model_fields?view_type=list&id=null"
          disabled={
            fieldsAccess.find(
              (field) => field.fieldName === "settingsFieldsMenu",
            )?.invisible
          }
        >
          <i className="bi bi-list-columns-reverse me-1"></i>
          <span>Campos</span>
        </NavDropdown.Item>
      </NavDropdown>
    </>
  );
}

export default TopNavItems;
