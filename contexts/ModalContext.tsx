"use client";
import ModalConfirm from "@/components/modals/ModalConfirm";
import ModalError from "@/components/modals/ModalError";
// import AlertModal from "@/components/modals/AlertModal";
import { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "error" | "confirm" | "alert" | null;

interface ModalContextType {
  modalError: (msg: string) => void;
  modalAlert: (msg: string, title: string) => void;
  modalConfirm: (msg: string, onConfirm: () => void) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModals = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals debe usarse dentro de ModalProvider");
  return ctx;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [message, setMessage] = useState("");
  //   const [modalTitle, setModalTitle] = useState<string>("");
  const [onConfirm, setOnConfirm] = useState<(() => void) | undefined>(
    undefined,
  );

  const hideModal = () => {
    setModalType(null);
    setMessage("");
    setOnConfirm(undefined);
  };

  const modalError = (msg: string) => {
    setModalType("error");
    setMessage(msg);
  };

  const modalAlert = (msg: string) => {
    setModalType("alert");
    setMessage(msg);
    // setModalTitle(title);
  };

  const modalConfirm = (msg: string, confirmCb: () => void) => {
    setModalType("confirm");
    setMessage(msg);
    setOnConfirm(() => confirmCb);
  };

  return (
    <ModalContext.Provider
      value={{ modalError, modalAlert, modalConfirm, hideModal }}
    >
      {children}

      <ModalError
        show={modalType === "error"}
        string={message}
        onHide={hideModal}
      />

      <ModalConfirm
        show={modalType === "confirm"}
        string={message}
        onHide={hideModal}
        action={onConfirm}
      />

      {/* <AlertModal
        show={modalType === "alert"}
        string={message}
        onHide={hideModal}
        title={modalTitle}
      /> */}
    </ModalContext.Provider>
  );
};
