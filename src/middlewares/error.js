// const error = (err, req, res, next) => {
// 1. Catat error asli di konsol terminal server untuk kebutuhan debugging Anda
// console.error("🔥 ERROR DETECTED:", err.message);

// 2. Tentukan status default (500 jika tidak ada kondisi yang cocok)
//let statusCode = 500;
//   let message = "Terjadi kesalahan internal pada server.";

// 3. Petakan error kustom yang dilempar dari Lapisan SERVICE
//  if (err.message.includes("tidak ditemukan") || err.message.includes("tidak valid")) {
//     statusCode = 404;
//     message = err.message;
// } else if (err.message.includes("wajib diisi") || err.message.includes("sudah terdaftar") || err.message.includes("Gagal")) {
//     statusCode = 400;
//      message = err.message;
//  }

// 4. Petakan jika ada error bawaan dari PRISMA (misal: error validasi database)
//  if (err.code === "P2002") {
//     statusCode = 400;
//     message = "Gagal memproses data. Ada kolom unik yang duplikat di database.";
// } else if (err.code === "P2025") {
//      statusCode = 404;
//     message = "Data yang Anda cari tidak ditemukan di database.";  }

// 5. Kirim respon JSON seragam ke client/frontend
// return res.status(statusCode).json({
//     success: false,
//      error: message
//  });
//};

//module.exports = { error };
const error = (err, req, res, next) => {
    console.error("🔥 ERROR DETECTED:", err.message);

    let statusCode = 500;
    let message = "Terjadi kesalahan internal pada server.";

    // Error dari AppError
    if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (
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

    // Error Prisma
    if (err.code === "P2002") {
        statusCode = 400;
        message = "Gagal memproses data. Ada kolom unik yang duplikat di database.";
    } else if (err.code === "P2025") {
        statusCode = 404;
        message = "Data yang Anda cari tidak ditemukan di database.";
    }

    return res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = { error };