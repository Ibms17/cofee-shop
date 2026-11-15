const prisma = require('../config/db.js');
const AppError = require('../utils/error.js');

const createMenu = async (data, user) => {
    const { name, price, categoryId } = data;

    // 1. Validasi Kategori wajib ada di sistem
    return await prisma.$transaction(async (tx) => {
        const category = await tx.category.findUnique({
            where: { id: Number(categoryId) }
        });
        if (!category) {
            throw new AppError("Kategori tidak ditemukan", 404);
        }

        const existName = await tx.menu.findFirst({
            where: { name, outletId: user.outletId }
        });
        if (existName) {
            throw new AppError("Nama menu sudah terdaftar di gerai Anda!", 400);
        }

        const lastMenu = await tx.menu.findFirst({ orderBy: { id: 'desc' } });
        const nextNumber = (lastMenu?.id ?? 0) + 1;
        const sku = `${String(nextNumber).padStart(4, '0')}`;

        return await tx.menu.create({
            data: {
                name,
                price: Number(price),
                sku,
                categoryId: Number(categoryId),
                outletId: user.outletId
            }
        });
    },
        {
            // Mencegah dua transaksi membaca baris terakhir yang sama secara bersamaan
            isolationLevel: 'Serializable'
        }
    );
};

const getAllMenus = async (user, kriteriaQuery) => {
    const { search, sort } = kriteriaQuery;
    let kondisiWhere = {};

    if (user.role !== "OWNER") {
        kondisiWhere.outletId = user.outletId;
    }

    if (search) {
        kondisiWhere.name = {
            contains: search,
            mode: "insensitive"
        };
    }

    let aturanUrutan = {};
    if (sort === "asc" || sort === "desc") {
        aturanUrutan.price = sort;
    } else {
        aturanUrutan.id = "desc";
    }

    return await prisma.menu.findMany({
        where: kondisiWhere,
        orderBy: aturanUrutan
    });
};

const updateMenu = async (id, data, user) => {
    const { name, price } = data;

    const menu = await prisma.menu.findFirst({
        where: { id: Number(id), outletId: user.outletId }
    });
    if (!menu) {
        throw new AppError("Menu tidak ditemukan di gerai Anda!", 404);
    }

    return await prisma.menu.update({
        where: { id: menu.id },
        data: { name, price: Number(price) }
    });
};

const deleteMenu = async (id, user) => {
    const menu = await prisma.menu.findFirst({
        where: { id: Number(id), outletId: user.outletId }
    });
    if (!menu) {
        throw new AppError("Menu tidak ditemukan di gerai Anda, gagal menghapus!", 404);
    }

    return await prisma.menu.delete({
        where: { id: menu.id }
    });
};

module.exports = { createMenu, getAllMenus, updateMenu, deleteMenu };