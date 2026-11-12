const prisma = require('../config/db.js');
const AppError = require('../utils/error.js');

const approveStaffByRole = async (id, outletId, expectedRole) => {
    if (!outletId) {
        throw new AppError("ID Gerai (outletId) wajib diisi saat menyetujui akun.", 400);
    }

    // Pastikan gerai tujuan benar-benar ada di database
    const outlet = await prisma.outlet.findUnique({
        where: { id: Number(outletId) }
    });

    if (!outlet) {
        throw new AppError("Gerai (outlet) tidak ditemukan.", 404);
    }

    // Cari akun yang akan disetujui
    const user = await prisma.user.findUnique({
        where: { id: Number(id) }
    });

    if (!user) {
        throw new AppError(`Akun ${expectedRole} tidak ditemukan.`, 404);
    }

    // Pastikan role akun sesuai dengan endpoint yang dipanggil
    if (user.role !== expectedRole) {
        throw new AppError(`Akun yang dipilih bukan ${expectedRole}.`, 400);
    }

    // Pastikan statusnya masih PENDING
    if (user.status !== "PENDING") {
        throw new AppError(`Status ${expectedRole} bukan PENDING (saat ini: ${user.status}).`, 400);
    }

    // Setujui registrasi dan ikat ke outletId
    return await prisma.user.update({
        where: { id: user.id },
        data: {
            outletId: Number(outletId),
            status: "APPROVED"
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            outletId: true,
            status: true
        }
    });
};

// 2. Fungsi pembungkus (wrapper) agar controller lama tetap berjalan tanpa diubah
const approveAdmin = (id, outletId) => approveStaffByRole(id, outletId, "ADMIN");
const approveKasir = (id, outletId) => approveStaffByRole(id, outletId, "KASIR");
const approveBarista = (id, outletId) => approveStaffByRole(id, outletId, "BARISTA");

module.exports = {
    approveStaffByRole,
    approveAdmin,
    approveKasir,
    approveBarista
};