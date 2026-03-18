"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { Form, Modal, Button } from "react-bootstrap";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { useController, useFormContext } from "react-hook-form";
import { createImage, deleteImage } from "@/app/actions/image-actions";
import { useModals } from "@/contexts/ModalContext";
import { useAccess } from "@/contexts/AccessContext";

interface ImageFieldProps {
  name: string;
  label?: string;
  folder: string | null;
  width: number;
  height: number;
  remove?: boolean;
  editable?: boolean;
  invisible?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  inline?: boolean;
  aling?: "start" | "center" | "end";
}

export function FieldImage({
  name,
  label,
  folder,
  width = 120,
  height = 120,
  remove = true,
  invisible,
  readOnly,
  inline,
  disabled,
  aling = "center",
}: ImageFieldProps) {
  const access = useAccess({ fieldName: name });

  const { control } = useFormContext();
  const { modalError } = useModals();

  const {
    field: { value, onChange },
    fieldState: { error },
    formState: { isSubmitting },
  } = useController({ name, control });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSource, setImageSource] = useState<string | null>(value ?? null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  /* ---------------- Cropper state ---------------- */
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  /* ---------------- Sync RHF ---------------- */
  useEffect(() => {
    setImageSource(value ?? null);
  }, [value]);

  /* ---------------- Remove ---------------- */
  const handleRemoveImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (access?.readonly) return false;

    const toastId = toast.loading("Eliminando imagen...");
    const res = await deleteImage(imageSource || "");

    if (!res.success) {
      modalError(res.message);
      toast.dismiss(toastId);
      return;
    }

    setImageSource(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success(res.message, { id: toastId });
  };

  /* ---------------- Select image ---------------- */
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setRawFile(file);
    setImageSource(objectUrl);
    setShowCropper(true);
  };

  /* ---------------- Crop utils ---------------- */
  const getCroppedImg = async (imageSrc: string, cropPixels: any) => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((res) => (image.onload = res));

    const canvas = document.createElement("canvas");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height,
    );

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        resolve(
          new File([blob], rawFile?.name ?? "cropped.jpg", {
            type: "image/jpeg",
          }),
        );
      }, "image/jpeg");
    });
  };

  /* ---------------- Confirm crop ---------------- */
  const handleCropConfirm = async () => {
    if (!imageSource || !croppedAreaPixels) return;

    const croppedFile = await getCroppedImg(imageSource, croppedAreaPixels);
    if (!croppedFile) return;

    const toastId = toast.loading("Subiendo imagen...", {
      position: "bottom-right",
    });

    const formData = new FormData();
    formData.append("image", croppedFile);

    const res = await createImage({ formData, folder });

    if (!res.success) {
      modalError(res.message);
      toast.dismiss(toastId);
      return;
    }

    setImageSource(res.data ?? null);
    onChange(res.data ?? null);
    toast.success(res.message, { id: toastId });
    setShowCropper(false);
  };

  /* ---------------- Image UI ---------------- */
  const imageUI = (
    <>
      <div
        role="button"
        onClick={() => {
          if (readOnly || isSubmitting || access?.readonly) return null;
          fileInputRef.current?.click();
        }}
        className="position-relative d-inline-block"
        title={name}
      >
        <NextImage
          src={imageSource ?? "/images/avatar_default.svg"}
          alt="imageField"
          width={width}
          height={height}
          unoptimized
          className="img-fluid rounded"
          style={{
            objectFit: "cover",
            width: `${width}px`,
            height: `${height}px`,
            cursor: readOnly ? "default" : "pointer",
          }}
        />

        {imageSource && remove && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="btn btn-danger btn-sm rounded-circle position-absolute"
            style={{
              top: "-8px",
              right: "-8px",
              width: 25,
              height: 25,
              padding: 0,
              fontSize: "0.75rem",
            }}
            disabled={disabled}
          >
            <i className="bi bi-trash-fill" />
          </button>
        )}

        <Form.Control
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImage}
          className="d-none"
          readOnly={readOnly || isSubmitting || access?.readonly}
          disabled={disabled}
        />
      </div>

      {error && <p className="text-danger small mt-1">{error.message}</p>}
    </>
  );

  if (invisible) return null;
  if (access?.invisible) return null;

  /* ---------------- Layout ---------------- */
  if (inline) {
    return imageUI;
  }

  return (
    <Form.Group className={`mb-1 d-flex justify-content-${aling}`}>
      {label && (
        <Form.Label className="fw-semibold m-0 w-25">{label}</Form.Label>
      )}
      <div>{imageUI}</div>

      {/* Cropper modal */}
      <Modal show={showCropper} onHide={() => setShowCropper(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Recortar imagen</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: 400, position: "relative" }}>
          {imageSource && (
            <Cropper
              image={imageSource}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCropper(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCropConfirm}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </Form.Group>
  );
}
