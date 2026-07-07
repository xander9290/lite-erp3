"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Badge, Button, Dropdown, Stack } from "react-bootstrap";
import Clock from "./Clock";
import { useAuth } from "@/hooks/sessionStore";
import Image from "next/image";
import toast from "react-hot-toast";
import styles from "./TopNavUser.module.css";

function TopNavUser() {
  const { user, changeCompany, companyCode } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const handleChangeCompany = async (id: string | null) => {
    if (!id) return;

    const toastId = toast.loading("Cambio de empresa en ejecución...", {
      position: "top-right",
    });

    try {
      await changeCompany({ companyId: id });
      toast.success("Se ha cambiado la empresa", { id: toastId });
    } catch {
      toast.error("No se pudo cambiar la empresa", { id: toastId });
    }
  };

  if (!mounted) {
    return <div className={styles.placeholder} />;
  }

  return (
    <Stack
      direction="horizontal"
      gap={2}
      className={`${styles.topNavUser} align-items-center`}
    >
      <Dropdown align="end">
        <Dropdown.Toggle
          variant="link"
          className={`${styles.toggle} text-decoration-none px-2 py-1 border-0 d-flex align-items-center gap-2`}
        >
          <Badge
            bg="success"
            pill
            className={`${styles.companyBadge} text-uppercase`}
          >
            {companyCode}
          </Badge>

          <Image
            width={28}
            height={28}
            unoptimized
            src={user?.image ?? "/images/avatar_default.svg"}
            alt={user?.name ?? "Usuario"}
            className={styles.avatar}
          />

          <span className={`${styles.userName} fw-semibold text-body`}>
            {user?.name}
          </span>
        </Dropdown.Toggle>

        <Dropdown.Menu className={`${styles.menu} shadow-sm border-0 mt-2`}>
          <Dropdown.Header className="small text-muted">
            Empresas
          </Dropdown.Header>

          {user?.companies.map((company) => (
            <Dropdown.Item
              key={company.id}
              onClick={() => handleChangeCompany(company.id)}
              title={company.current ? "Empresa actual" : ""}
              active={company.current}
              className={styles.companyItem}
            >
              <div className="d-flex align-items-center gap-2">
                <span className={styles.checkIcon}>
                  {company.current && <i className="bi bi-check-circle-fill" />}
                </span>

                <div className="d-flex flex-column lh-sm">
                  <span className="fw-semibold">{company.name}</span>
                  <small
                    className={company.current ? "text-white-50" : "text-muted"}
                  >
                    {company.code}
                  </small>
                </div>
              </div>
            </Dropdown.Item>
          ))}

          <Dropdown.Divider />

          <Dropdown.Item
            onClick={() => signOut()}
            className="text-danger d-flex align-items-center gap-2"
          >
            <i className="bi bi-box-arrow-right" />
            <span>Cerrar sesión</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <div className={styles.separator} />

      <Button
        variant="link"
        type="button"
        className={`${styles.clockButton} text-decoration-none text-body border-0 px-2 py-1`}
        title="Hora actual"
      >
        <Clock />
      </Button>

      <div className={styles.separator} />

      <Button
        variant="link"
        type="button"
        className={`${styles.themeButton} text-body border-0 px-2 py-1`}
        onClick={toggleDarkMode}
        title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        {darkMode ? (
          <i className="bi bi-sun-fill" />
        ) : (
          <i className="bi bi-moon-stars-fill" />
        )}
      </Button>
    </Stack>
  );
}

export default TopNavUser;
