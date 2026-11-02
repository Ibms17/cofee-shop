const { z } = require('zod');

// 📦 A. SKEMA VALIDASI UNTUK SETIAP ITEM (OrderItem)
const orderItemSchema = z.object({
    productId: z
        .coerce.number({ required_error: "ID Produk wajib dilampirkan!" })
        .int({ message: "Format ID Produk tidak valid!" }), // Wajib UUID valid

    quantity: z
        .number({ required_error: "Jumlah barang harus angka bulat!" })
        .int({ message: "Jumlah barang harus berupa angka bulat!" }) // Anti desimal
        .positive({ message: "Jumlah barang minimal harus 1!" }) // Anti 0 dan minus
        .default(1)
        .optional(),
});

// 🧾 B. SKEMA VALIDASI UTAMA UNTUK NOTA PESANAN (Order)
const orderSchema = z.object({
    customerName: z
        .string()
        .trim()
        .max(50, { message: "Nama pelanggan maksimal 50 karakter." })
        .optional()
        .or(z.literal('')), // Mengizinkan string kosong atau tidak diisi

    orderType: z
        .enum(['DINE_IN', 'TAKEAWAY'], {
            errorMap: () => ({ message: "Tipe pesanan harus DINE_IN atau TAKEAWAY!" })
        })
        .optional(),

    // Validasi Array: Memastikan kasir mengirimkan minimal 1 item belanjaan
    orderItems: z
        .array(orderItemSchema)
        .nonempty({ message: "Keranjang belanja tidak boleh kosong! Masukkan minimal 1 produk." }),
});

module.exports = { orderItemSchema, orderSchema };