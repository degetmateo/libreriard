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
