// "use server";

// import { createClient } from "@supabase/supabase-js";
// import { ActionResponse } from "../../../libs/definitions";

// export async function createImage({
//   formData,
//   folder,
// }: {
//   formData: FormData;
//   folder: string | null;
// }): Promise<ActionResponse<string>> {
//   console.log("- Subiendo imagen a Supabase...");

//   const file = formData.get("image") as File | null;

//   if (!file) {
//     return { success: false, message: "La imagen no fue cargada" };
//   }

//   if (!folder) {
//     return {
//       success: false,
//       message: "No se ha definido el nombre de la carpeta",
//     };
//   }

//   // 👉 Cliente de Supabase (Service Role, solo en server)
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
//   );

//   // Nombre único para evitar colisiones
//   const filePath = `${folder}/${Date.now()}-${file.name}`;

//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // 👉 Subir archivo al bucket
//     const { data, error } = await supabase.storage
//       .from("lite-erp3-images") // <-- tu bucket real
//       .upload(filePath, buffer, {
//         contentType: file.type,
//         upsert: false,
//       });

//     if (error) {
//       console.error("Error al subir a Supabase:", error);
//       return { success: false, message: error.message };
//     }

//     // 👉 Obtener URL pública
//     const { data: publicUrlData } = supabase.storage
//       .from("lite-erp3-images")
//       .getPublicUrl(data.path);

//     console.log("- Imagen subida [Supabase] OK:", publicUrlData.publicUrl);

//     return {
//       success: true,
//       message: "Imagen subida correctamente",
//       data: publicUrlData.publicUrl,
//     };
//   } catch (err: any) {
//     console.error(err);
//     return { success: false, message: err.message };
//   }
// }

// export async function deleteImage(path: string): Promise<ActionResponse<null>> {
//   if (!path) {
//     return {
//       success: false,
//       message: "No se proporcionó la ruta de la imagen",
//     };
//   }

//   console.log("Borrando imagen en Supabase:", path);

//   // Cliente de Supabase (solo server)
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!, // clave secreta en el servidor
//   );

//   try {
//     // Extraer solo la ruta dentro del bucket
//     // Si tu URL pública es algo como:
//     // https://xxxxx.supabase.co/storage/v1/object/public/lite-erp1-images/products/123.png
//     // necesitamos: products/123.png
//     let filePath = path;

//     if (path.startsWith("http")) {
//       const url = new URL(path);
//       // todo lo que está después de `/object/public/lite-erp1-images/`
//       filePath = url.pathname.split("/object/public/lite-erp3-images/")[1];
//     }

//     const { error } = await supabase.storage
//       .from("lite-erp3-images")
//       .remove([filePath]);

//     if (error) {
//       console.error("Error al borrar imagen:", error);
//       return { success: false, message: error.message };
//     }

//     console.log("Imagen borrada correctamente:", filePath);

//     return {
//       success: true,
//       message: "Imagen eliminada correctamente",
//       data: null,
//     };
//   } catch (err: any) {
//     console.error(err);
//     return { success: false, message: err.message };
//   }
// }

"use server";

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { ActionResponse } from "../../../libs/definitions";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const CLOUDINARY_ROOT_FOLDER = "lite-erp3-images";

/**
 * Convierte un Buffer en un stream de subida de Cloudinary.
 */
function uploadBuffer(
  buffer: Buffer,
  options: {
    folder: string;
    publicId?: string;
  },
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: options.folder,
        public_id: options.publicId,
        overwrite: false,
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary no devolvió información de la imagen"));
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

/**
 * Extrae el public_id desde una URL pública de Cloudinary.
 *
 * Ejemplo:
 * https://res.cloudinary.com/demo/image/upload/v123/lite-erp3-images/products/imagen.jpg
 *
 * Resultado:
 * lite-erp3-images/products/imagen
 */
function getPublicIdFromCloudinaryUrl(urlValue: string): string | null {
  try {
    const url = new URL(urlValue);
    const pathParts = url.pathname.split("/").filter(Boolean);

    const uploadIndex = pathParts.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    let publicIdParts = pathParts.slice(uploadIndex + 1);

    // Elimina la versión: v123456789
    if (publicIdParts.length > 0 && /^v\d+$/.test(publicIdParts[0])) {
      publicIdParts = publicIdParts.slice(1);
    }

    if (publicIdParts.length === 0) {
      return null;
    }

    const lastPartIndex = publicIdParts.length - 1;

    // El public_id no incluye la extensión.
    publicIdParts[lastPartIndex] = publicIdParts[lastPartIndex].replace(
      /\.[^.]+$/,
      "",
    );

    return decodeURIComponent(publicIdParts.join("/"));
  } catch {
    return null;
  }
}

export async function createImage({
  formData,
  folder,
}: {
  formData: FormData;
  folder: string | null;
}): Promise<ActionResponse<string>> {
  console.log("- Subiendo imagen a Cloudinary...");

  const file = formData.get("image");

  if (!(file instanceof File)) {
    return {
      success: false,
      message: "La imagen no fue cargada",
    };
  }

  if (!folder?.trim()) {
    return {
      success: false,
      message: "No se ha definido el nombre de la carpeta",
    };
  }

  if (!file.type.startsWith("image/")) {
    return {
      success: false,
      message: "El archivo proporcionado no es una imagen",
    };
  }

  if (file.size === 0) {
    return {
      success: false,
      message: "La imagen está vacía",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudinaryFolder = `${CLOUDINARY_ROOT_FOLDER}/${folder}`;

    const result = await uploadBuffer(buffer, {
      folder: cloudinaryFolder,
    });

    console.log("- Imagen subida [Cloudinary] OK:", result.secure_url);
    console.log("- Public ID:", result.public_id);

    return {
      success: true,
      message: "Imagen subida correctamente",
      data: result.secure_url,
    };
  } catch (error: unknown) {
    console.error("Error al subir imagen a Cloudinary:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al subir la imagen",
    };
  }
}

export async function deleteImage(
  pathOrPublicId: string,
): Promise<ActionResponse<null>> {
  if (!pathOrPublicId?.trim()) {
    return {
      success: false,
      message: "No se proporcionó la ruta de la imagen",
    };
  }

  console.log("Borrando imagen en Cloudinary:", pathOrPublicId);

  try {
    /*
     * Permite recibir:
     *
     * 1. Una URL completa:
     *    https://res.cloudinary.com/.../image/upload/v123/.../imagen.jpg
     *
     * 2. Directamente el public_id:
     *    lite-erp3-images/products/imagen
     */
    const publicId = pathOrPublicId.startsWith("http")
      ? getPublicIdFromCloudinaryUrl(pathOrPublicId)
      : pathOrPublicId;

    if (!publicId) {
      return {
        success: false,
        message: "No fue posible obtener el public_id de la imagen",
      };
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    /*
     * Cloudinary normalmente devuelve:
     * - result: "ok"
     * - result: "not found"
     */
    if (result.result !== "ok" && result.result !== "not found") {
      console.error("Cloudinary no pudo borrar la imagen:", result);

      return {
        success: false,
        message: `No fue posible eliminar la imagen: ${result.result}`,
      };
    }

    if (result.result === "not found") {
      return {
        success: false,
        message: "La imagen no fue encontrada en Cloudinary",
      };
    }

    console.log("Imagen borrada correctamente:", publicId);

    return {
      success: true,
      message: "Imagen eliminada correctamente",
      data: null,
    };
  } catch (error: unknown) {
    console.error("Error al borrar imagen de Cloudinary:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar la imagen",
    };
  }
}
