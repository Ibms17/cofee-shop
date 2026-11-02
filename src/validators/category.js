const { z } = require('zod');

const categorySchema = z.object({
    name: z
        .string({ required_error: "Nama kategori wajib diisi!" })
        .trim()
        .min(4, { message: "Nama kategori terlalu pendek! Minimal harus 4 karakter." }),
})

module.exports = categorySchema;