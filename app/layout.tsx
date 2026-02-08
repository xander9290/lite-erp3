import type { Metadata } from "next";
import "./globals.css";

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
      </body>
    </html>
  );
}
