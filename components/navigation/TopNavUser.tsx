"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button, Dropdown, Stack } from "react-bootstrap";
import Clock from "./Clock";
import { useAuth } from "@/hooks/sessionStore";
import Image from "next/image";

function TopNavUser() {
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Solo cliente
  useEffect(() => {
    const stored = localStorage.getItem("darkModeSelection");
    const isDark = stored === "dark";

    setDarkMode(isDark);
    document.documentElement.setAttribute(
      "data-bs-theme",
      isDark ? "dark" : "light",
    );

    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;

    setDarkMode(newMode);
    document.documentElement.setAttribute(
      "data-bs-theme",
      newMode ? "dark" : "light",
    );

    localStorage.setItem("darkModeSelection", newMode ? "dark" : "light");
  };

  // 🚫 Evita hydration mismatch
  if (!mounted) return null;

  return (
    <Stack direction="horizontal" gap={2}>
      <Dropdown>
        <Dropdown.Toggle
          variant="light"
          className="border-0 d-flex gap-2 align-items-center"
        >
          <Image
            width={25}
            height={25}
            unoptimized
            src={user?.image ?? "/images/avatar_default.svg"}
            alt=""
            className="rounded"
          />
          <strong>
            <small>{user?.name}</small>
          </strong>
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
