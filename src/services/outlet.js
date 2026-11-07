const prisma = require('../config/db.js');

const createOutlet = async (data) => {
    const { address } = data;
    const defaultBrand = await prisma.brand.findFirst();

    const lastOutlet = await prisma.outlet.findFirst({
        orderBy: { id: 'desc' }
    });

    const nextNumber = (lastOutlet?.id ?? 0) + 1;
    const code = `CAFE${String(nextNumber).padStart(4, '0')}`;

    return prisma.outlet.create({
        data: {
            code,
            address,
            brandId: defaultBrand.id // Otomatis terikat ke brand utama
        },
        include: {
            brand: { select: { name: true } } // Menampilkan nama brand pada respons
        }
    });
};

const getAllOutlets = async (kriteriaQuery) => {
    const { search } = kriteriaQuery;
    let kondisiWhere = {};

    if (search) {
        kondisiWhere.OR = [
            { code: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } }
        ];
    }

    return await prisma.outlet.findMany({
        where: kondisiWhere,
        include: { products: true }
    });
};

const updateOutlet = async (id, address) => {
    return await prisma.outlet.update({
        where: { id: parseInt(id) },
        data: { address }
    });
};

module.exports = { createOutlet, getAllOutlets, updateOutlet };