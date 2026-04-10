// "use client";

// import { Spinner } from "react-bootstrap";

// export default function LoadingPage() {
//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100">
//       <Spinner animation="border" variant="primary" role="status" />
//     </div>
//   );
// }

"use client";

import { Spinner } from "react-bootstrap";

export default function LoadingPage() {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease-in-out",
      }}
    >
      <div
        className="text-center p-4 rounded-4 shadow bg-body-tertiary"
        style={{
          minWidth: "250px",
          animation: "scaleIn 0.3s ease-in-out",
        }}
      >
        <Spinner
          animation="border"
          variant="primary"
          role="status"
          style={{ width: "3.5rem", height: "3.5rem" }}
        />
        <h5 className="mt-3 mb-0 text-primary">Cargando</h5>
        <p className="text-muted small mt-2 mb-0">
          Por favor, espera un momento...
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
