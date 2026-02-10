import { auth } from "@/app/libs/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function Home() {
  const session = await auth();

  if (session) {
    redirect("/app");
  }

  return (
    <div className="container vh-100 d-flex align-items-center">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 text-center">
              <h1 className="fw-bold mb-2">LITE ERP</h1>
              <p className="text-muted mb-4">Sistema de gestión empresarial</p>

              <Link href="/login" className="btn btn-primary btn-lg w-100">
                Iniciar sesión
              </Link>
            </div>
          </div>

          <p className="text-center text-muted mt-3 small">
            © {new Date().getFullYear()} LITE ERP
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
