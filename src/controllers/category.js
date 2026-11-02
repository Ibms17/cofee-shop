const categoryService = require('../services/category.js');
const categorySchema = require('../validators/category.js'); // Asumsi menggunakan Zod/Joi

// CREATE: Membuat Kedai Baru
const create = async (req, res) => {
    // Validasi Input
    const validation = categorySchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    // Kirim data ke service
    const newCategory = await categoryService.createCategory(validation.data);
    return res.status(201).json({ success: true, message: "Kategori berhasil dibuat", data: newCategory });
};

// READ ALL: Mengambil Semua Kedai (Bisa dengan pencarian via req.query)
const getAll = async (req, res) => {
    const categories = await categoryService.getAllCategories(req.query);
    return res.status(200).json({ success: true, data: categories });
};

// READ ONE: Mengambil Detail 1 Konser Berdasarkan ID
const getById = async (req, res) => {
    const { id } = req.params;
    const concert = await concertService.getConcertById(Number(id));
    return res.status(200).json({ success: true, data: concert });
};

// UPDATE: Mengubah Data Konser
const update = async (req, res) => {
    const { id } = req.params;

    // Validasi Input
    const validation = concertSchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    const updatedConcert = await concertService.updateConcert(Number(id), validation.data);
    return res.status(200).json({ success: true, message: "Konser berhasil diperbarui", data: updatedConcert });
};

// DELETE: Menghapus Konser Permanen
const destroy = async (req, res) => {
    const { id } = req.params;
    await concertService.destroyConcert(Number(id));
    return res.status(200).json({ success: true, message: "Konser berhasil dihapus secara permanen" });
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    destroy
};