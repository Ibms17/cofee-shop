const prisma = require('../config/db.js');

const createBooking = async (userId, arrayItemsBelanjaan) => {
    // Buka pintu sirkuit transaksi tertutup
    return await prisma.$transaction(async (tx) => {
        let kalkulasiTotalHarga = 0;

        // --- TAHAP 1: VALIDASI DATA DAN PERHITUNGAN STOK KOTAK LOGISTIK ---
        for (const item of arrayItemsBelanjaan) {
            const ticket = await tx.ticket.findUnique({
                where: { id: item.ticketId },
                include: { concert: true }
            });

            if (!ticket) throw new Error(`Kategori tiket ID ${item.ticketId} tidak ditemukan!`);

            // KONSEP GOJEK/SHOPEE: Hadang langsung jika kuota kursi stadion habis
            if (ticket.quota < item.quantity) {
                throw new Error(`Transaksi Gagal! Sisa tiket kelas ${ticket.name} untuk konser ${ticket.concert.title} hanya sisa ${ticket.quota} buah, sedangkan Anda memesan ${item.quantity} buah.`);
            }

            kalkulasiTotalHarga += ticket.price * item.quantity;
        }

        // --- TAHAP 2: DAFTARKAN KEPALA NOTA INDUK BOOKING ---
        const notaBooking = await tx.booking.create({
            data: {
                userId: parseInt(userId),
                totalAmount: kalkulasiTotalHarga,
                status: "PENDING" // Menunggu konfirmasi modul payment gateway luar
            }
        });

        // --- TAHAP 3: LOCK SNAPSHOT MATI & EKSEKUSI POTONG KUOTA REAL-TIME ---
        for (const item of arrayItemsBelanjaan) {
            const ticket = await tx.ticket.findUnique({
                where: { id: item.ticketId },
                include: { concert: true }
            });

            // Trik Snapshot Abadi: Kunci judul konser dan harga detik itu ke dalam string teks mati
            await tx.bookingItem.create({
                data: {
                    bookingId: notaBooking.id,
                    ticketId: item.ticketId,
                    concertTitle: ticket.concert.title, // Terkunci abadi dari perubahan judul promotor
                    categoryName: ticket.name,          // Terkunci abadi dari perubahan nama kelas
                    priceSnap: ticket.price,            // Terkunci abadi dari inflasi harga tiket di masa depan
                    quantity: item.quantity
                }
            });

            // Potong kapasitas sisa kuota kursi stadion secara fisik di cloud Neon
            await tx.ticket.update({
                where: { id: item.ticketId },
                data: { quota: ticket.quota - item.quantity }
            });
        }

        // Kembalikan hasil nota final untuk disajikan sebagai balasan status 201 oleh controller HTTP
        return notaBooking;
    });
};

const getBookingsByUser = async (userId) => {
    // Mengeksekusi kueri murni ke database Neon
    return await prisma.booking.findMany({
        where: {
            userId: parseInt(userId)
        },
        include: {
            // Ikut sertakan rincian item kelas tiket yang dibeli beserta snapshot harganya
            bookingItems: true
        },
        orderBy: {
            id: 'desc' // Nota terbaru yang dibeli otomatis muncul paling atas (Teranyar)
        }
    });
};

// --- KALIBRASI EKSPOR DI BARIS PALING BAWAH ---
// Pastikan fungsi baru ini didaftarkan di dalam module.exports!
module.exports = { createBooking, getBookingsByUser }