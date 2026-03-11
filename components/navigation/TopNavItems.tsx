"use client";

import Link from "next/link";
import { NavDropdown } from "react-bootstrap";

function TopNavItems() {
  return (
    <>
      <NavDropdown
        title={
          <>
            <i className="bi bi-graph-up me-1"></i>
            <span>Ventas</span>
          </>
        }
      >
        <NavDropdown.Item title="saleQuotsMenu">Cotizaciones</NavDropdown.Item>
        <NavDropdown.Item title="saleSalesMenu">Órdenes</NavDropdown.Item>
      </NavDropdown>
      <NavDropdown
        title={
          <>
            <i className="bi bi-cart-plus-fill me-1"></i>
            <span>Compras</span>
          </>
        }
      >
        <NavDropdown.Item title="purchaseQuotsMenu">
          Cotizaciones
        </NavDropdown.Item>
        <NavDropdown.Item title="purchaseOrdersMenu">Compras</NavDropdown.Item>
      </NavDropdown>
      <NavDropdown
        title={
          <>
            <i className="bi bi-file-earmark-text-fill me-1"></i>
            <span>Facturación</span>
          </>
        }
      >
        <NavDropdown.Item title="invoicingCustomersMenu">
          <i className="bi bi-person-vcard-fill me-1"></i>
          <span>Clietes</span>
        </NavDropdown.Item>
        <NavDropdown.Item title="invoicingSuppliersMenu">
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
      >
        <NavDropdown.Item title="partnersCustomersMenu">
          <i className="bi bi-person-vcard-fill me-1"></i>
          <span>Clientes</span>
        </NavDropdown.Item>
        <NavDropdown.Item title="partnersSuppliersMenu">
          <i className="bi bi-building me-1"></i>
          <span>Proveedores</span>
        </NavDropdown.Item>
        <NavDropdown.Item title="partnersInternalsMenu">
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
      >
        <NavDropdown.Item title="inventoryWarehousesMenu">
          <i className="bi bi-grid-1x2-fill me-1"></i>
          <span>Almacenes</span>
        </NavDropdown.Item>
        <NavDropdown.Item title="inventoryProductTemplate">
          <i className="bi bi-boxes me-1"></i>
          <span>Productos</span>
        </NavDropdown.Item>
        <NavDropdown.Item title="inventoryManufacturing">
          <i className="bi bi-flask me-1"></i>
          <span>Fabricación</span>
        </NavDropdown.Item>
        <NavDropdown.Item title="inventoryStockWarehouse">
          <i className="bi bi-grid-3x3 me-1"></i>
          <span>Existencias</span>
        </NavDropdown.Item>
        <NavDropdown.Item title="inventoryStockMove">
          <i className="bi bi-arrow-left-right me-1"></i>
          <span>Traslados</span>
        </NavDropdown.Item>
        <NavDropdown.Item title="inventoryStockMoveLine">
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
      >
        <NavDropdown.Item
          title="settingsUsersMenu"
          as={Link}
          href="/app/users?view_type=list&id=null"
        >
          <i className="bi bi-person-fill me-1"></i>
          <span>Usuarios</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="settingsGroupsMenu"
          as={Link}
          href="/app/groups?view_type=list&id=null"
        >
          <i className="bi bi-people-fill me-1"></i>
          <span>Grupos</span>
        </NavDropdown.Item>
        <NavDropdown.Item title="settingsCompaniesMenu">
          <i className="bi bi-buildings me-1"></i>
          <span>Empresas</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="settingsModelsMenu"
          as={Link}
          href="/app/models?view_type=list&id=null"
        >
          <i className="bi bi-database-fill me-1"></i>
          <span>Modelos</span>
        </NavDropdown.Item>
        <NavDropdown.Item
          title="settingsFieldsMenu"
          as={Link}
          href="/app/fields?view_type=list&id=null"
        >
          <i className="bi bi-list-columns-reverse me-1"></i>{" "}
          <span>Campos</span>
        </NavDropdown.Item>
      </NavDropdown>
    </>
  );
}

export default TopNavItems;
