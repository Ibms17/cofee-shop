const { z } = require('zod');

const productSchema = z.object({
    name: z
        .string({ required_error: "Nama produk wajib diisi!" })
        .trim()
        .min(5, { message: "Nama produk terlalu pendek! Minimal harus 5 karakter." }),

    price: z
        .coerce.number({ required_error: "Harga produk wajib diisi!" })
        .positive({ message: "Harga produk tidak boleh 0 atau bernilai minus!" }),

    categoryId: z
        .coerce.number({ required_error: "ID Kategori wajib dilampirkan!" })
        .int({ message: "ID Kategori harus berupa angka bulat!" }),

    outletId: z
        .coerce.number({ required_error: "ID Outlet wajib dilampirkan!" })
        .int({ message: "ID Outlet harus berupa angka bulat!" })
        .optional(),

    sku: z
        .string()
        .trim()
        .max(20, { message: "SKU tidak boleh lebih dari 20 karakter." })
        .optional()
        .or(z.literal('')),
});

module.exports = productSchema;