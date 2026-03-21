"use server";

import { createClient } from "@supabase/supabase-js";
import { ActionResponse } from "../libs/definitions";

export async function createImage({
  formData,
  folder,
}: {
  formData: FormData;
  folder: string | null;
}): Promise<ActionResponse<string>> {
  console.log("- Subiendo imagen a Supabase...");

  const file = formData.get("image") as File | null;

  if (!file) {
    return { success: false, message: "La imagen no fue cargada" };
  }

  if (!folder) {
    return {
      success: false,
      message: "No se ha definido el nombre de la carpeta",
    };
  }

  // 👉 Cliente de Supabase (Service Role, solo en server)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Nombre único para evitar colisiones
  const filePath = `${folder}/${Date.now()}-${file.name}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 👉 Subir archivo al bucket
    const { data, error } = await supabase.storage
      .from("lite-erp1-images") // <-- tu bucket real
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Error al subir a Supabase:", error);
      return { success: false, message: error.message };
    }

    // 👉 Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from("lite-erp1-images")
      .getPublicUrl(data.path);

    console.log("- Imagen subida [Supabase] OK:", publicUrlData.publicUrl);

    return {
      success: true,
      message: "Imagen subida correctamente",
      data: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
}

export async function deleteImage(path: string): Promise<ActionResponse<null>> {
  if (!path) {
    return {
      success: false,
      message: "No se proporcionó la ruta de la imagen",
    };
  }

  console.log("Borrando imagen en Supabase:", path);

  // Cliente de Supabase (solo server)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // clave secreta en el servidor
  );

  try {
    // Extraer solo la ruta dentro del bucket
    // Si tu URL pública es algo como:
    // https://xxxxx.supabase.co/storage/v1/object/public/lite-erp1-images/products/123.png
    // necesitamos: products/123.png
    let filePath = path;

    if (path.startsWith("http")) {
      const url = new URL(path);
      // todo lo que está después de `/object/public/lite-erp1-images/`
      filePath = url.pathname.split("/object/public/lite-erp1-images/")[1];
    }

    const { error } = await supabase.storage
      .from("lite-erp1-images")
      .remove([filePath]);

    if (error) {
      console.error("Error al borrar imagen:", error);
      return { success: false, message: error.message };
    }

    console.log("Imagen borrada correctamente:", filePath);

    return {
      success: true,
      message: "Imagen eliminada correctamente",
      data: null,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err.message };
  }
}
