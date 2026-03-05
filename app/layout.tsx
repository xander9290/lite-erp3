import type { Metadata } from "next";
import "./globals.css";
// import "bootswatch/dist/cosmo/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "LITE ERP3",
  description: "Tercera versión de lite erp3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
