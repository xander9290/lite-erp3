import z from "zod";

export const userLoginSchema = z.object({
  login: z.string().min(1, "Usuario es requerido"),
  password: z
    .string()
    .min(4, "La contraseña debe tener mínimo 4 caracteres")
    .max(10, "La contraseña debe tener máximo 10 caracteres"),
});

export type UserLoginSchemaType = z.infer<typeof userLoginSchema>;

export const userLoginSchemaDefault: UserLoginSchemaType = {
  login: "",
  password: "",
};
