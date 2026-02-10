import { SessionProvider } from "next-auth/react";

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <div className="d-flex flex-column vh-100">
        <main className="container-fluid flex-fill overflow-hidden">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}

export default AppLayout;
