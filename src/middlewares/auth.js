const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Ambil token dari header HTTP bernama 'Authorization'
  const authHeader = req.headers['authorization'];

  // Format token standar industri biasanya: Bearer <string_token>
  // Kita split berdasarkan spasi untuk mengambil token aslinya saja
  const token = authHeader && authHeader.split(' ')[1];

  // LOGIKA IF (!) PERTAMA: Jika user tidak membawa token sama sekali
  if (!token) {
    return res.status(401).json({ error: "Akses ditolak! Anda belum login / token tidak disertakan." });
  }

  try {
    // 2. Verifikasi keaslian token menggunakan kunci rahasia server (.env)
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Masukkan biodata user yang ada di dalam token ke dalam objek 'req' Express
    // Agar rute berikutnya (seperti createProduct) tahu siapa yang sedang mengakses
    req.user = verified;

    // 4. Lolos! Perintahkan Express untuk melanjutkan ke fungsi utama di controller
    next();
  } catch (error) {
    // LOGIKA CATCH: Jika token sudah kedaluwarsa atau stempelnya palsu
    res.status(403).json({ error: "Token tidak valid atau sudah kedaluwarsa!" });
  }
};

module.exports = verifyToken;