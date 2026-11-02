const paymentService = require('../services/payment.js');
const paymentSchema = require('../validators/payment.js'); // Asumsi menggunakan Zod/Joi

// CREATE: Membuat Kedai Baru
const create = async (req, res) => {
    // Validasi Input
    const validation = paymentSchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    // Kirim data ke service
    const newPayment = await paymentService.createPayment(req.user, validation.data);
    return res.status(201).json({ success: true, message: "Pembayaran berhasil", data: newPayment });
};

// READ ALL: Mengambil Semua Kedai (Bisa dengan pencarian via req.query)
const getAll = async (req, res) => {
    const payments = await paymentService.getAllProducts(req.query);
    return res.status(200).json({ success: true, data: payments });
};

// READ ONE: Mengambil Detail 1 Konser Berdasarkan ID
const getById = async (req, res) => {
    const { id } = req.params;
    const payment = await paymentService.getProductById(Number(id));
    return res.status(200).json({ success: true, data: payment });
};

// UPDATE: Mengubah Data Konser
const update = async (req, res) => {
    const { id } = req.params;

    // Validasi Input
    const validation = paymentSchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    const updatedProduct = await paymentService.updateProduct(Number(id), validation.data);
    return res.status(200).json({ success: true, message: "Produk berhasil diperbarui", data: updatedProduct });
};

// DELETE: Menghapus Konser Permanen
const destroy = async (req, res) => {
    const { id } = req.params;
    await paymentService.destroyProduct(Number(id));
    return res.status(200).json({ success: true, message: "Kedai berhasil dihapus secara permanen" });
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    destroy
};