const { z } = require('zod');

// 📦 A. SKEMA VALIDASI UNTUK SETIAP ITEM (OrderItem)
const paymentSchema = z.object({
    orderId: z
        .coerce.number({ required_error: "ID Pesanan wajib ada!" })
        .int({ message: "Format ID Pesanan tidak valid!" }), // Wajib UUID valid

    paymentMethod: z
        .enum(['CASH', 'QRIS'], { errorMap: () => ({ message: "Metode pembayaran harus CASH atau QRIS" }) }),

    amountPaid: z
        .number({ required_error: "Jumlah uang yang dibayarkan wajib diisi!" })
        .positive({ message: "Jumlah uang harus lebih besar dari 0!" }),

    isDonated: z
        .boolean({ invalid_type_error: "Status donasi harus berupa boolean!" })
        .default(false)
        .optional(),
});

module.exports = paymentSchema;