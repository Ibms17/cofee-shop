const outletService = require('../services/outlet.js');
const { createSchema, updateSchema } = require('../validators/outlet.js'); // Asumsi menggunakan Zod/Joi

// CREATE: Membuat Kedai Baru
const create = async (req, res) => {

    const validation = createSchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    // Kirim data ke service
    const newOutlet = await outletService.createOutlet(validation.data);
    return res.status(201).json({ success: true, message: "Gerai berhasil ditambahkan", data: newOutlet });
};

// READ ALL: Mengambil Semua Kedai (Bisa dengan pencarian via req.query)
const getAll = async (req, res) => {
    const outlets = await outletService.getAllOutlets(req.query);
    return res.status(200).json({ success: true, data: outlets });
};

const getById = async (req, res) => {
    const { id } = req.params;
    const outlet = await outletService.getOutletById(Number(id));
    return res.status(200).json({ success: true, data: outlet });
};

const update = async (req, res) => {
    const { id } = req.params;

    const validation = updateSchema.safeParse(req.body, req.user);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    const updatedOutlet = await outletService.updateOutlet(Number(id), validation.data);
    return res.status(200).json({ success: true, message: "Outlet berhasil diperbarui", data: updatedOutlet });
};

module.exports = {
    create,
    getAll,
    getById,
    update
};