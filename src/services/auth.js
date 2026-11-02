const prisma = require('../config/db.js'); // Menggunakan koneksi tunggal Anda
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/error.js');


/**
 * Pendaftaran User/Customer Baru
 */
const registerUser = async (dataSaringanZod) => {
    const { name, email, password, role } = dataSaringanZod;

    // 1. Validasi duplikasi email di database Neon
    const emailExist = await prisma.user.findUnique({ where: { email } });

    if (emailExist) throw new Error("Email tersebut sudah terdaftar! Gunakan email lain.");


    // 2. Acak password mentah menjadi kode rahasia 10 lapis
    const passwordDihash = await bcrypt.hash(password, 10);

    // 3. Simpan data murni tanpa melibatkan tabel eksternal
    return await prisma.user.create({
        data: { name, email, password: passwordDihash, role, status: "PENDING" },
        select: { id: true, name: true, email: true, role: true, status: true } // Jangan kembalikan password di JSON
    });

};

/**
 * Validasi Masuk Aplikasi
 */
const loginUser = async (dataSaringanZod) => {
    const { email, password } = dataSaringanZod;

    const user = await prisma.user.findUnique({ where: { email } });
    //if (user.status !== 'APPROVED') {
    //return res.status(403).json({ message: 'Akun Anda belum disetujui oleh Owner.' });}
    if (!user) throw new AppError("Email tidak ditemukan!");

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new AppError("Password salah!");

    if (user.status !== "APPROVED") {
        throw new AppError("Akun Anda belum diapprove.", 403);
    }

    // Cetak token digital yang memuat jabatan (Role) untuk melintasi middleware satpam
    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role, outletId: user.outletId },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return {
        user: { id: user.id, email: user.email, name: user.name, role: user.role, outletId: user.outletId },
        token
    };
};

module.exports = { registerUser, loginUser };