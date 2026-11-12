const cron = require('node-cron');
const prisma = require('../config/db.js');

const startOrderCleanupJob = () => {
    // Jadwal: Berjalan setiap 5 menit sekali ('*/5 * * * *')
    cron.schedule('*/5 * * * *', async () => {
        try {
            // Batas waktu: 15 menit yang lalu
            const batasWaktu = new Date(Date.now() - 15 * 60 * 1000);

            // Ubah semua order berstatus PENDING yang lewat dari 15 menit menjadi CANCELLED
            const result = await prisma.order.updateMany({
                where: {
                    status: 'PENDING',
                    createdAt: {
                        lt: batasWaktu,
                    },
                },
                data: {
                    status: 'CANCELLED',
                },
            });

            // Hanya cetak log jika ada order yang benar-benar dibatalkan agar terminal tetap bersih
            if (result.count > 0) {
                console.log(
                    `[CRON JOB] ${new Date().toISOString()} - ${result.count} pesanan menggantung otomatis dibatalkan (CANCELLED).`
                );
            }
        } catch (error) {
            console.error('[CRON JOB ERROR] Gagal membersihkan pesanan menggantung:', error);
        }
    });

    console.log('⏳ Cron Job pembersihan order menggantung aktif (berjalan setiap 5 menit).');
};

module.exports = { startOrderCleanupJob };
