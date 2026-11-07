import { z } from 'zod';

export const updateBankDetailsSchema = z.object({
  bankTransferDetails: z.object({
    bankName: z.string().min(1, 'El nombre del banco es obligatorio.'),
    accountHolder: z.string().min(1, 'El titular de la cuenta es obligatorio.'),
    cuitCuil: z.string().min(1, 'El CUIT/CUIL es obligatorio.'),
    cbu: z.string().min(22, 'El CBU debe contener 22 dígitos.').max(22),
    alias: z.string().min(1, 'El alias es obligatorio.'),
    accountType: z.string().min(1, 'El tipo de cuenta es obligatorio.'),
    notes: z.string().default('')
  })
});

export const updateLegalTextsSchema = z.object({
  termsAndConditions: z.string().min(1, 'Los términos y condiciones no pueden estar vacíos.'),
  privacyPolicy: z.string().min(1, 'La política de privacidad no puede estar vacía.')
});

export const updateFooterContactSchema = z.object({
  footerContact: z.object({
    address: z.string().min(1, 'La dirección es obligatoria.'),
    googleMapsUrl: z.string().url('El enlace de Google Maps debe ser una URL válida.'),
    schedule: z.string().min(1, 'Los horarios son obligatorios.'),
    email: z.string().email('El correo de contacto no es válido.'),
    phone: z.string().min(1, 'El teléfono de contacto es obligatorio.')
  })
});

export const catalogItemSchema = z.object({
  item: z.string().min(1, 'El valor no puede estar vacío.')
});
