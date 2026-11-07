const prisma = require('../config/db.js');
const AppError = require('../utils/error.js');

const createCategory = async (data) => {
    const { name } = data
    const existCategory = await prisma.category.findUnique({ where: { name } });
    if (existCategory) {
        throw new AppError("Kategori sudah ada!")
    };
    return await prisma.category.create({
        data: { name }
    });
};

const getAllCategories = async () => {
    return await prisma.category.findMany();
};

module.exports = { createCategory, getAllCategories };