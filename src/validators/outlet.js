const { z } = require('zod');

const createSchema = z.object({
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