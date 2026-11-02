const prisma = require('../config/db.js');

const createOutlet = async (data) => {
    const { name, address } = data;

    const lastOutlet = await prisma.outlet.findFirst({
        orderBy: { id: 'desc' }
    });

    const nextNumber = (lastOutlet?.id ?? 0) + 1;
    const code = `CAFE${String(nextNumber).padStart(3, '0')}`;

    return prisma.outlet.create({
        data: { name, address, code }
    });
};

const getAllOutlets = async (kriteriaQuery) => {
    // ⚡ SEKARANG HANYA MENGAMBIL PARAMETER SEARCH
    const { search } = kriteriaQuery;
    let kondisiWhere = {};

    // A. SEARCH GANDA: Cari berdasarkan kode outlet ATAU alamat outlet
    if (search) {
        kondisiWhere.OR = [
            { code: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } }
        ];
    }

    // 🚀 SYNTAX AKHIR: Ramping tanpa ada orderBy (sorting)
    return await prisma.outlet.findMany({
        where: kondisiWhere,
        include: { products: true } // Menyertakan daftar menu produk yang terikat di outlet ini
    });
};

const updateOutlet = async (id, address) => {
    return await prisma.outlet.update({
        where: { id: parseInt(id) },
        data: { address }
    });
};

module.exports = { createOutlet, getAllOutlets, updateOutlet };