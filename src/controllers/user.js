const userService = require("../services/user.js");

// Di dalam controller user (bagian approve)
const approveAdmin = async (req, res, next) => {
    try {
        const { userId } = req.params; // atau req.body.userId tergantung rute Anda
        const { outletId } = req.body;  // 🌟 Ambil outletId dari body Postman
        //  BENAR (id pertama, outletId kedua)
        const result = await userService.approveAdmin(req.params.id, req.body.outletId);


        return res.status(200).json({
            message: "Registrasi Admin berhasil disetujui.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const approveKasir = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { outletId } = req.body;
        const result = await userService.approveKasir(req.params.id, req.body.outletId);

        return res.status(200).json({
            message: "Registrasi Kasir berhasil disetujui.",
            data: result
        });
    } catch (err) {
        next(err);
    }
};

const approveBarista = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { outletId } = req.body;
        const result = await userService.approveBarista(req.params.id, req.body.outletId);

        return res.status(200).json({
            message: "Registrasi Barista berhasil disetujui.",
            data: result
        });
    } catch (err) {
        next(err);
    }
};


module.exports = { approveAdmin, approveKasir, approveBarista };