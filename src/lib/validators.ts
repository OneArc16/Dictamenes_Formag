import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(3, 'Usuario requerido'),
  password: z.string().min(3, 'Contraseña requerida'),
});
export type LoginInput = z.infer<typeof LoginSchema>;
