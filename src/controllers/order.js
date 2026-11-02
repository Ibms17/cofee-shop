const orderService = require('../services/order.js');
const { orderSchema } = require('../validators/order.js');

// CREATE: Membuat Kedai Baru
const create = async (req, res) => {
    // Validasi Input
    const validation = orderSchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    // Kirim data ke service
    const newOrder = await orderService.createOrder(req.user, validation.data);
    return res.status(201).json({ success: true, message: "Pesanan berhasil dibuat", data: newOrder });
};

// READ ALL: Mengambil Semua Kedai (Bisa dengan pencarian via req.query)
const getAll = async (req, res) => {
    const products = await productService.getAllProducts(req.query);
    return res.status(200).json({ success: true, data: products });
};

// READ ONE: Mengambil Detail 1 Konser Berdasarkan ID
const getById = async (req, res) => {
    const { id } = req.params;
    const product = await productService.getProductById(Number(id));
    return res.status(200).json({ success: true, data: product });
};

// UPDATE: Mengubah Data Konser
const update = async (req, res) => {
    const { id } = req.params;

    // Validasi Input
    const validation = productSchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    const updatedProduct = await productService.updateProduct(Number(id), validation.data);
    return res.status(200).json({ success: true, message: "Produk berhasil diperbarui", data: updatedProduct });
};

// DELETE: Menghapus Konser Permanen
const destroy = async (req, res) => {
    const { id } = req.params;
    await productService.destroyProduct(Number(id));
    return res.status(200).json({ success: true, message: "Kedai berhasil dihapus secara permanen" });
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    destroy
};