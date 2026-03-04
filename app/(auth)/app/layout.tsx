import TopNav from "@/components/navigation/TopNav";
import { ModalProvider } from "@/contexts/ModalContext";
import { SessionProvider } from "next-auth/react";

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ModalProvider>
        <div className="d-flex flex-column vh-100">
          <TopNav />
          <main className="container-fluid flex-fill overflow-hidden">
            {children}
          </main>
        </div>
      </ModalProvider>
    </SessionProvider>
  );
}

export default AppLayout;
