# Coffee Shop Multi-Outlet POS API - Secure & Field Researched

> Bukan CRUD biasa. Dibangun dari observasi lapangan: kasir, resto, kasus bank, dan 5 tahun belajar (4x stuck, 1x bisa baca error).

**Live API:** (akan diisi setelah deploy Railway)
**Stack:** Express.js, Prisma ORM, PostgreSQL, JWT, RBAC

### Kenapa Beda?

**1. Anti Fake Owner (Belajar dari Proyek Kos)**
Owner hanya 1, tidak bisa registrasi publik. Di-seed via `npx prisma db seed` oleh developer. Mencegah owner palsu bikin kos/gerai fiktif yang merugikan customer.

**2. Anti Cross-Gerai (outletId dari JWT, bukan body)**
Admin create product tidak perlu tulis outletId. outletId diambil otomatis dari `req.user.outletId` (JWT). Mencegah Admin Gerai A iseng bikin produk di Gerai B via Postman.

**3. Anti Price Fraud (Harga dari DB, bukan dari kasir)**
Kasir hanya kirim `productId` + `qty`. Harga & subtotal dihitung backend dari DB. Mencegah kasir nakal ubah harga 25rb jadi 1rb.

**4. Financial Rule: PAID No CANCEL (Belajar dari Bank)**
Pernah kena tipu transfer, bank jawab "transaksi sukses tidak bisa dibatalkan". Diterapkan di Order: PENDING boleh cancel, PAID tidak boleh cancel. Harus lewat proses REFUND dengan approval Admin/Owner.

**5. No Stock untuk Produk Jadi (Observasi Resto)**
Resto hampir tidak pernah bilang habis. Produk coffee made-to-order, cepat basi. Pakai `isAvailable` boolean, bukan `stock`. Stok dipantau di bahan baku, bukan produk jadi.

### Workflow
- Owner (seed) -> Bikin Invitation Link (role & outletId dikunci di token) -> Kirim via WA
- Kandidat (di luar sistem, setelah interview) -> Buka link -> Auto role=kasir/barista/admin, outlet=otomatis -> Isi password saja
- Kasir -> Create Order (productId only) -> PENDING -> PAID -> No CANCEL

### Lessons Learned
- Debug 2+1+1 jam cashier vs kasir karena copas 2 chat AI beda -> Solusi: Single Source of Truth di `constants/roles.js`
- Master data 4 minggu karena mikirin keamanan, bukan 1 hari jadi via AI
- 5x belajar, 4x stuck karena tidak ada yang ngajarin baca error. Sekarang bisa baca error dari Terminal + Postman, telusuri Route -> Controller -> Service -> Schema

### Cara Jalanin
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
