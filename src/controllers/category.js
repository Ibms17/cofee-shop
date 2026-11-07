const categoryService = require('../services/category.js');
const categorySchema = require('../validators/category.js');

const create = async (req, res) => {
    const validation = categorySchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }
    const newCategory = await categoryService.createCategory(validation.data);
    return res.status(201).json({ success: true, message: "Kategori berhasil dibuat", data: newCategory });
};

const getAll = async (req, res) => {
    const categories = await categoryService.getAllCategories(req.query);
    return res.status(200).json({ success: true, data: categories });
};

module.exports = { create, getAll };