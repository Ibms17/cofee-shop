const prisma = require('../config/db.js');
const AppError = require('../utils/error.js');

const createProduct = async (data, user) => {
    const { name, price, categoryId } = data;

    // 1. Ambil outletId langsung dari user yang sedang login 🌟
    const userOutlet = user.outletId;

    // 2. Validasi Kategori
    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    });
    if (!category) {
        throw new AppError("Category tidak ditemukan", 404);
    }

    // 3. Validasi Hak Akses Admin (Kunci produk hanya untuk outlet tempat dia bertugas) 🌟
    if (user.role === "ADMIN" && !userOutlet) {
        throw new AppError("Forbidden: Admin belum ditugaskan ke outlet mana pun.", 403);
    }

    // 4. Cek duplikasi nama produk
    const existName = await prisma.product.findFirst({ where: { name } });
    if (existName) {
        throw new Error("Nama produk sudah ada!");
    }

    // 5. Pembuatan SKU Otomatis
    const lastProduct = await prisma.product.findFirst({
        orderBy: { id: 'desc' }
    });
    const nextNumber = (lastProduct?.id ?? 0) + 1;
    const sku = `${String(nextNumber).padStart(4, '0')}`;

    // 6. Simpan ke database dengan memasukkan userOutletId 🌟
    return await prisma.product.create({
        data: {
            name,
            price: Number(price),
            sku,
            categoryId: Number(categoryId),
            outletId: Number(userOutlet) // 👈 Otomatis terkunci ke outlet admin di sini
        }
    });
};

/* const getAllProducts = async (kriteriaQuery) => {
    const { search, sort } = kriteriaQuery;
    let kondisiWhere = {};

    // A. SEARCH GANDA: Cari berdasarkan nama judul konser ATAU nama artis band-nya
    if (search) {
        kondisiWhere.OR = [
            { name: { contains: search, mode: 'insensitive' } }
        ];
    }
    // C. SORTING: Urutkan tanggal dari yang terdekat (asc) atau terlama (desc)
    let aturanUrutan = {};
    if (sort === 'asc' || sort === 'desc') {
        aturanUrutan.price = sort;
    } else {
        aturanUrutan.id = 'desc'; // Default: Konser teranyar diinput muncul di atas
    }

    return await prisma.product.findMany({
        where: kondisiWhere,
        orderBy: aturanUrutan,
        include: { products: true } // Ikut sertakan daftar harga tiket di dalam objek konser
    });
}; */

const getAllProducts = async (user, kriteriaQuery) => {
    const { search, sort } = kriteriaQuery;
    let kondisiWhere = {};

    if (user.role !== "OWNER") {
        kondisiWhere.outletId = user.outletId;
    }

    if (search) {
        kondisiWhere.name = {
            contains: search,
            mode: "insensitive"
        };
    }

    let aturanUrutan = {};

    if (sort === "asc" || sort === "desc") {
        aturanUrutan.price = sort;
    } else {
        aturanUrutan.id = "desc";
    }

    return await prisma.product.findMany({
        where: kondisiWhere,
        orderBy: aturanUrutan
    });
};

const updateProduct = async (id, data) => {
    const { name, description, price } = data;
    return await prisma.product.update({
        where: { id: parseInt(id) },
        data: { name, description, price }
    });
};

const deleteProduct = async (id) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new CustomError("Produk tidak ditemukan, gagal menghapus!", 404);
    return await prisma.product.delete({ where: { id: parseInt(id) } });
};

module.exports = { createProduct, getAllProducts, updateProduct, deleteProduct };