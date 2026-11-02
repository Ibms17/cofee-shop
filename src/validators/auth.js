const { z } = require('zod'); // Impor Zod

// 1. Aturan Validasi untuk Registrasi Akun Baru
const registerSchema = z.object({
  name: z
    .string({ required_error: "Nama wajib diisi!" })
    .min(3, { message: "Nama terlalu pendek! Minimal harus 3 karakter." }),
  email: z
    .string({ required_error: "Email wajib diisi!" })
    .email({ message: "Format email tidak valid! Harus mengandung tanda @" }),

  password: z
    .string({ required_error: "Password wajib diisi!" })
    .min(6, { message: "Password minimal harus terdiri dari 6 karakter!" }),
  outletId: z
    .coerce.number({ required_error: "ID Outlet wajib dilampirkan!" })
    .int({ message: "ID Outlet harus berupa angka bulat!" })
    .optional()
    .or(z
      .literal('')),
  role: z
    .enum(['ADMIN', 'KASIR', 'BARISTA']),
});

// 2. Aturan Validasi untuk Login
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email wajib diisi!" })
    .email({ message: "Format email tidak valid!" }),
  password: z
    .string({ required_error: "Password wajib diisi!" })
});

module.exports = { registerSchema, loginSchema };