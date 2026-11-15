const error = (err, req, res, next) => {
    console.error("🔥 ERROR DETECTED:", err);

    let statusCode = 500;
    let message = "Terjadi kesalahan internal pada server.";

    // 1. Error kustom dari AppError (Prioritas utama)
    if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // 2. Error spesifik bawaan Prisma ORM
    else if (err.code === "P2002") {
        statusCode = 400;
        message = "Gagal memproses data. Ada data unik (seperti email, SKU, atau kode gerai) yang sudah terdaftar.";
    } else if (err.code === "P2025") {
        statusCode = 404;
        message = "Data yang Anda cari atau ubah tidak ditemukan di database.";
    } else if (err.code === "P2003") {
        statusCode = 400;
        message = "Gagal memproses data karena relasi ID referensi tidak ditemukan atau masih digunakan.";
    } else if (err.code === "P2034") {
        // Error konflik transaksi dari isolationLevel: 'Serializable'
        statusCode = 409;
        message = "Sistem sedang memproses transaksi serupa secara bersamaan. Silakan coba beberapa saat lagi.";
    }
    // 3. Fallback pencocokan teks pesan error (jika masih ada throw new Error biasa)
    else if (err.message) {
        if (
            err.message.includes("tidak ditemukan") ||
            err.message.includes("tidak valid")
        ) {
            statusCode = 404;
            message = err.message;
        } else if (
            err.message.includes("wajib diisi") ||
            err.message.includes("sudah terdaftar") ||
            err.message.includes("Gagal")
        ) {
            statusCode = 400;
            message = err.message;
        }
    }

    return res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = { error };