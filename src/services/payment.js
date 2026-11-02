const prisma = require('../config/db.js');
const AppError = require('../utils/error.js');

const createPayment = async (user, data) => {
    if (user.role !== 'KASIR' || !user.outletId) {
        throw new AppError("Akses ditolak. Hanya KASIR aktif yang dapat memproses pembayaran", 403);
    }

    // Membawa field isDonated dari hasil validasi Zod Validator Anda
    const { orderId, amountPaid, paymentMethod, isDonated } = data;

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
        let change = 0;       // Uang kembalian yang harus dikembalikan fisik ke customer
        let donationAmount = 0; // Nominal uang yang dialihkan menjadi donasi

        // 2. ATURAN BISNIS KALKULASI PEMBAYARAN & DONASI MURNI
        if (paymentMethod === 'QRIS') {
            if (Number(amountPaid) !== totalWajibBayar) {
                throw new AppError(`Untuk QRIS, uang harus pas (Rp${totalWajibBayar.toLocaleString('id-ID')})`, 400);
            }
            change = 0;
        } else if (paymentMethod === 'CASH') {
            if (Number(amountPaid) < totalWajibBayar) {
                throw new AppError(`Uang tunai kurang! Total tagihan: Rp${totalWajibBayar.toLocaleString('id-ID')}`, 400);
            }

            // Hitung kembalian murni sebelum keputusan donasi
            const sisaUang = Number(amountPaid) - totalWajibBayar;

            if (isDonated) {
                // 💡 LOGIKA UTAMA: Jika didonasikan, seluruh sisa uang masuk kantong donasi
                donationAmount = sisaUang;
                change = 0; // Kasir TIDAK PERLU mengembalikan uang fisik ke pelanggan (Kembalian = Rp0)
            } else {
                // Jika tidak didonasikan, uang wajib dikembalikan utuh ke pelanggan
                donationAmount = 0;
                change = sisaUang;
            }
        }

        // 3. SIMPAN DATA KE TABEL PAYMENT (Patuh pada skema Anda)
        // Kita simpan donationAmount ke database jika ke depan Anda membuat kolom donasi,
        // Untuk saat ini kita pastikan nilai 'change' yang disimpan adalah nilai setelah keputusan donasi.
        const paymentRecord = await tx.payment.create({
            data: {
                orderId: order.id,
                paymentMethod: paymentMethod,
                amountPaid: Number(amountPaid),
                change: change // Menyimpan sisa kembalian asli yang keluar dari laci kasir
            }
        });

        // 4. UPDATE STATUS ORDER MENJADI SUCCESS
        const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: { status: 'QUEUE' },
            include: {
                outlet: { select: { name: true } },
                kasir: { select: { name: true } }
            }
        });

        // 5. FORMAT DATA RESPON (Sangat Informatif untuk Struk Restoran Profesional)
        return {
            invoiceNo: updatedOrder.invoiceNo,
            createdAt: paymentRecord.createdAt,
            namaOutlet: updatedOrder.outlet?.name || "Gerai Utama",
            namaKasir: updatedOrder.kasir?.name || "Kasir",
            metodePembayaran: paymentRecord.paymentMethod,
            totalTagihan: totalWajibBayar,
            totalBayar: paymentRecord.amountPaid,
            donasiMasuk: donationAmount, // Terpampang nyata di struk sebagai laporan amal pelanggan
            kembalianFisik: paymentRecord.change, // Teks panduan di layar kasir untuk mengembalikan uang
            statusPesanan: updatedOrder.status
        };
    });
};

module.exports = { createPayment };