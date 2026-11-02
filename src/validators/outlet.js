const { z } = require('zod');

const createSchema = z.object({
    name: z
        .string({ required_error: "Nama outlet wajib diisi!" })
        .trim()
        .min(3, { message: "Nama outlet terlalu pendek! Minimal harus 3 karakter." }),

    address: z
        .string({ required_error: "Alamat outlet wajib diisi!" })
        .trim()
        .min(11, { message: "Alamat outlet terlalu pendek! Minimal harus 11 karakter." }),
});

const updateSchema = z.object({
    address: z
        .string({ required_error: "Alamat outlet wajib diisi!" })
        .trim()
        .min(11, { message: "Alamat outlet terlalu pendek! Minimal harus 11 karakter." }),
});

module.exports = { createSchema, updateSchema };