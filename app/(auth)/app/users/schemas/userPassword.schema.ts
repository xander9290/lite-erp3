import { z } from "zod";

export const userPasswordSchema = z
  .object({
    password1: z
      .string()
      .min(4, "La contraseña debe contener mínimo 4 caracteres"),
    password2: z
      .string()
      .min(4, "La contraseña debe contener mínimo 4 caracteres"),
  })
  .refine((data) => data.password1 === data.password2, {
    error: "Las contraseñas no coinciden",
    path: ["password1"],
  });

export type UserPasswordType = z.infer<typeof userPasswordSchema>;

export const userPasswordSchemaDefault: UserPasswordType = {
  password1: "",
  password2: "",
};
