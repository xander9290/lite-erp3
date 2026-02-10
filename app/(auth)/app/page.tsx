"use client";

import { signOut } from "next-auth/react";
import { Button } from "react-bootstrap";

function AppHome() {
  return <Button onClick={() => signOut()}>Cerrar sesión</Button>;
}

export default AppHome;
