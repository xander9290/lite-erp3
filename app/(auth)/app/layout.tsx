import TopNav from "@/components/navigation/TopNav";
import { AccessProvider } from "@/contexts/AccessContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { SessionProvider } from "next-auth/react";

function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <AccessProvider>
        <ModalProvider>
          <div className="d-flex flex-column vh-100">
            <TopNav />
            <main className="container-fluid flex-fill overflow-hidden">
              {children}
            </main>
          </div>
        </ModalProvider>
      </AccessProvider>
    </SessionProvider>
  );
}

export default AppLayout;
