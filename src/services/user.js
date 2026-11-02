const prisma = require('../config/db.js');

const approveAdmin = async (id, outletId) => {
    // 1. Cari akun yang akan disetujui
    const user = await prisma.user.findUnique({
        where: { id: Number(id) }
    });

    if (!user) {
        throw new Error("Akun Admin tidak ditemukan.");
    }

    // 2. Pastikan akun tersebut memang Admin
    if (user.role !== "ADMIN") {
        throw new Error("Akun yang dipilih bukan Admin.");
    }

    // 3. Pastikan statusnya masih menunggu persetujuan
    if (user.status !== "PENDING") {
        throw new Error("Status Admin bukan PENDING.");
    }

    // 4. Setujui registrasi
    return await prisma.user.update({
        where: { id: user.id },
        data: { outletId: Number(outletId), status: "APPROVED" },
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

const approveKasir = async (id, outletId) => {
    // 1. Cari akun yang akan disetujui
    const user = await prisma.user.findUnique({
        where: { id: Number(id) }
    });

    if (!user) {
        throw new Error("Akun Kasir tidak ditemukan.");
    }

    // 2. Pastikan akun tersebut memang Admin
    if (user.role !== "KASIR") {
        throw new Error("Akun yang dipilih bukan Kasir.");
    }

    // 3. Pastikan statusnya masih menunggu persetujuan
    if (user.status !== "PENDING") {
        throw new Error("Status Kasir bukan PENDING.");
    }

    // 4. Setujui registrasi
    return await prisma.user.update({
        where: { id: user.id },
        data: { outletId: Number(outletId), status: "APPROVED" },
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

const approveBarista = async (id, outletId) => {
    // 1. Cari akun yang akan disetujui
    const user = await prisma.user.findUnique({
        where: { id: Number(id) }
    });

    if (!user) {
        throw new Error("Akun Barista tidak ditemukan.");
    }

    // 2. Pastikan akun tersebut memang Admin
    if (user.role !== "BARISTA") {
        throw new Error("Akun yang dipilih bukan Barista.");
    }

    // 3. Pastikan statusnya masih menunggu persetujuan
    if (user.status !== "PENDING") {
        throw new Error("Status Barista bukan PENDING.");
    }

    // 4. Setujui registrasi
    return await prisma.user.update({
        where: { id: user.id },
        data: { outletId: Number(outletId), status: "APPROVED" },
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

module.exports = { approveAdmin, approveKasir, approveBarista };