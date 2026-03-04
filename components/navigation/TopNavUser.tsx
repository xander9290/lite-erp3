"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button, Dropdown, Stack } from "react-bootstrap";
import Clock from "./Clock";
import { useAuth } from "@/hooks/sessionStore";

function TopNavUser() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("darkModeSelection") === "dark";
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute(
      "data-bs-theme",
      newMode ? "dark" : "light",
    );
    localStorage.setItem("darkModeSelection", newMode ? "dark" : "light");
  };

  // ✅ Este efecto solo corre al montar
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-bs-theme",
      darkMode ? "dark" : "light",
    );

    localStorage.setItem("darkModeSelection", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <Stack direction="horizontal" gap={2}>
      <Dropdown>
        <Dropdown.Toggle
          variant="light"
          className="border-0 d-flex gap-2 align-items-center"
        >
          <strong>{user?.name}</strong>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => signOut()}>
            <i className="bi bi-box-arrow-right me-2"></i>
            <span>Cerrar sesión</span>
          </Dropdown.Item>
          <Dropdown.Divider />
        </Dropdown.Menu>
      </Dropdown>
      <div className="vr" />
      <Button variant="light" type="button" className="text-uppercase border-0">
        <Clock />
      </Button>
      <div className="vr" />
      <Button className="border-0" variant="light" onClick={toggleDarkMode}>
        {darkMode ? (
          <i className="bi bi-sun-fill"></i>
        ) : (
          <i className="bi bi-moon-stars-fill"></i>
        )}
      </Button>
    </Stack>
  );
}

export default TopNavUser;
