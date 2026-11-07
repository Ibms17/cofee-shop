const prisma = require('../config/db.js');
const AppError = require('../utils/error.js');

const createPayment = async (user, data) => {
    const { orderId, amountPaid, paymentMethod, isDonated } = data;

    // Alur transaksi: berhasil semua atau gagal semua
    return await prisma.$transaction(async (tx) => {
        // 1. Cari data order yang berstatus PENDING di gerai kasir ini
        const order = await tx.order.findFirst({
            where: {
                id: Number(orderId),
                outletId: user.outletId
            }
        });

        if (!order) {
            throw new AppError("Data pesanan tidak ditemukan di gerai Anda", 404);
        }

        if (order.status !== 'PENDING') {
            throw new AppError(`Pesanan ini tidak dapat dibayar karena statusnya sudah ${order.status}`, 400);
        }

        const totalWajibBayar = order.totalAmount;
        let change = 0;       // Uang kembalian fisik ke customer
        let donationAmount = 0; // Nominal uang yang dialihkan menjadi donasi

        // 2. ATURAN BISNIS KALKULASI PEMBAYARAN & DONASI
        if (paymentMethod === 'QRIS') {
            if (Number(amountPaid) !== totalWajibBayar) {
                throw new AppError(`Untuk QRIS, uang harus pas (Rp${totalWajibBayar.toLocaleString('id-ID')})`, 400);
            }
            change = 0;
        } else if (paymentMethod === 'CASH') {
            if (Number(amountPaid) < totalWajibBayar) {
                throw new AppError(`Uang tunai kurang! Total tagihan: Rp${totalWajibBayar.toLocaleString('id-ID')}`, 400);
            }

            const sisaUang = Number(amountPaid) - totalWajibBayar;

            if (isDonated) {
                donationAmount = sisaUang;
                change = 0;
            } else {
                donationAmount = 0;
                change = sisaUang;
            }
        }

        // 3. SIMPAN DATA KE TABEL PAYMENT
        const paymentRecord = await tx.payment.create({
            data: {
                orderId: order.id,
                paymentMethod: paymentMethod,
                amountPaid: Number(amountPaid),
                change: change
            }
        });

        // 4. UPDATE STATUS ORDER MENJADI QUEUE 
        // Menggunakan relasi bertingkat ke brand untuk mengambil nama brand secara otomatis
        const updateOrder = await tx.order.update({
            where: { id: order.id },
            data: { status: 'QUEUE' },
            include: {
                outlet: {
                    include: {
                        brand: { select: { name: true } } // <--- Mengambil nama brand dari outlet
                    }
                },
                kasir: { select: { name: true } } // <--- Mengambil nama kasir otomatis dari relasi user/kasir
            }
        });

        // 5. FORMAT DATA RESPON UNTUK STRUK (Menggunakan namaBrand, bukan namaOutlet)
        return {
            invoiceNo: updateOrder.invoiceNo,
            createdAt: paymentRecord.createdAt,
            namaBrand: updateOrder.outlet?.brand?.name || "Kopisop", // <--- Otomatis nama brand
            namaKasir: updateOrder.kasir?.name || "Kasir",         // <--- Otomatis nama kasir yang login
            metodePembayaran: paymentRecord.paymentMethod,
            totalTagihan: totalWajibBayar,
            totalBayar: paymentRecord.amountPaid,
            donasiMasuk: donationAmount,
            kembalianFisik: paymentRecord.change,
            statusPesanan: updateOrder.status
        };
    });
};

module.exports = { createPayment };