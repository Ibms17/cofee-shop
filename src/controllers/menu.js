const menuService = require('../services/menu.js');
const menuSchema = require('../validators/menu.js');

const create = async (req, res) => {
    req.body.outletId = req.user.outletId;

    const validation = menuSchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    const newMenu = await menuService.createMenu(validation.data, req.user);
    return res.status(201).json({ success: true, message: "Menu berhasil ditambahkan", data: newMenu });
};

const getAll = async (req, res) => {
    const menus = await menuService.getAllMenus(req.user, req.query);
    return res.status(200).json({ success: true, data: menus });
};

const getById = async (req, res) => {
    const { id } = req.params;
    const menu = await menuService.getMenuById(Number(id));
    return res.status(200).json({ success: true, data: menu });
};

const update = async (req, res) => {
    const { id } = req.params;

    // Validasi Input
    const validation = menuSchema.safeParse(req.body);
    if (!validation.success) {
        const errorPesan = validation.error.issues.map(issue => issue.message).join(", ");
        return res.status(400).json({ success: false, error: errorPesan });
    }

    const updatedMenu = await menuService.updateMenu(Number(id), validation.data);
    return res.status(200).json({ success: true, message: "Menu berhasil diperbarui", data: updatedMenu });
};

module.exports = {
    create,
    getAll,
    getById,
    update
};