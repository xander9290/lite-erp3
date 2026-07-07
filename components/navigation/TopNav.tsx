"use client";

import { Container, Nav, Navbar } from "react-bootstrap";
import TopNavItems from "./TopNavItems";
import TopNavUser from "./TopNavUser";

function TopNav() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary" sticky="top">
      <Container fluid>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <TopNavItems />
          </Nav>
          <Nav>
            <TopNavUser />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default TopNav;
