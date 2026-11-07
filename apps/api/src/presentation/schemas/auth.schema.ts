import { z } from 'zod';
import { StaffRole } from '@libreriard/shared';

export const loginSchema = z.object({
  email: z.string().email('El correo electrónico no es válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.')
});

export const customerRegisterSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  cuitCuil: z.string().min(10, 'El CUIT/CUIL debe tener al menos 10 dígitos.'),
  email: z.string().email('El correo electrónico no es válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional()
});

export const tokenSchema = z.object({
  token: z.string().min(1, 'El token es requerido.')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('El correo electrónico no es válido.')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido.'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres.')
});

export const createStaffSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio.'),
  email: z.string().email('El correo electrónico no es válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  role: z.nativeEnum(StaffRole)
});
