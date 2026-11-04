Sistem POS & Manajemen Multi-Gerai Coffee Shop (Backend)

Aplikasi backend berbasis Node.js dan Express untuk mengelola operasional multi-gerai coffee shop serta alur kerja Point-of-Sale (POS) secara terintegrasi. Proyek ini dibangun dengan komitmen penuh pada aturan bisnis (business logic) dunia nyata yang ketat, isolasi data, serta penanganan error-handling yang andal.

Status Proyek saat Ini (Project Status)

• Modul Inisiasi & Pembuatan (Create): Selesai 100% (Hasil pengembangan intensif selama 5 minggu untuk merancang fondasi arsitektur, relasi skema, logika keamanan, dan isolasi data).
• Modul Get, Update, & Delete: Dalam tahap pengembangan lanjutan (refactoring bertahap dari basis arsitektur proyek manajemen kos sebelumnya).

Tech Stack

• Runtime Environment: Node.js
• Web Framework: Express.js
• Database: PostgreSQL
• ORM: Prisma ORM
• API Testing & Verification: Postman

Struktur Repositori

Proyek ini menerapkan pemisahan komponen (separation of concerns) yang bersih untuk menjaga kode tetap modular dan mudah di-debug:
text
├── src/                 # Kode sumber backend (Routes, Controllers, Services)
├── prisma/              # Skema relasional database dan skrip seeding
├── public/uploads/      # Penyimpanan aset/gambar statis lokal
├── .gitignore           # Konfigurasi pengecualian pelacakan Git
├── package.json         # Manajer dependensi proyek
└── prisma.config.ts     # Konfigurasi ORM Prisma
Gunakan kode dengan hati-hati.

Fitur Utama & Logika Bisnis (Fase Pembuatan / Create)

Sistem ini dirancang dengan aturan bisnis spesifik untuk menjaga integritas data operasional sejak data pertama kali dibuat:
• Role-Based Access Control (RBAC) & Akses Berlapis: Otentikasi ketat yang memisahkan empat peran utama:
	• Owner: Akun master tunggal yang dikunci langsung melalui mekanisme inisialisasi data (seed.js) untuk menutup celah registrasi super-admin publik. Owner memegang kendali penuh untuk menambah gerai, melihat laporan keuangan, dan menyetujui pendaftaran staf.
	• Admin: Akun staf gerai yang pendaftarannya wajib melalui jalur undangan khusus (invitation link) dari Owner dan memerlukan status approve sebelum aktif. Admin dibatasi hanya untuk mengelola menu di gerai tempat mereka ditugaskan.
	• Kasir: Menangani pemrosesan pembuatan pesanan (order) dan pencatatan pembayaran pelanggan.
	• Barista: Memantau antrean pesanan masuk dan memperbarui status progres pembuatan kopi.
• Isolasi Data Multi-Tenant (Multi-Gerai): Akun Admin secara otomatis terikat pada 1 ID gerai. Saat Admin menambahkan menu baru, sistem mendeteksi gerai mereka dan memetakannya secara otomatis tanpa perlu memasukkan geraiId manual, mengeliminasi risiko kesalahan input data antar-gerai.
• Integritas Transaksi Finansial dengan $transaction:
	• Harga Otomatis & Terkunci: Kasir dilarang memanipulasi harga secara manual. Kasir hanya menginput menuId, qty, dan jumlah uang dari pelanggan. Sistem secara otomatis menarik harga resmi dari database untuk kalkulasi total.
	• State-Lock Post-Payment: Pesanan yang sudah berstatus lunas otomatis dikunci oleh sistem agar tidak dapat dibatalkan demi keamanan arus kas bisnis.
	• Prisma $transaction: Menjamin seluruh rangkaian proses pembuatan pesanan (pembuatan struk, kalkulasi, pemotongan stok, dsb.) bersifat atomik—semuanya harus berhasil bersamaan atau dibatalkan seutuhnya jika terjadi kegagalan di tengah jalan (all-or-nothing).

Praktik Debugging & Troubleshooting Mandiri

Guna menangani kendala teknis dan mendeteksi anomali pada terminal maupun Postman selama pengembangan, proyek ini menerapkan metodologi pelacakan yang disiplin:
• Analisis Stack Trace: Mampu membaca baris dan kolom kode yang bermasalah langsung dari log error terminal untuk menelusuri akar masalah.
• End-to-End Flow Tracing: Menelusuri jalur eksekusi kode secara runtut mulai dari definisi URL di Route, logika penyaringan Controller, penanganan modul export/import, hingga eksekusi aturan bisnis pada Service layer.
• Data Type & Schema Validation: Memeriksa ketidaksinkronan antar-file, seperti ketidakcocokan tipe data, nama model, dan atribut pada berkas schema.prisma.
• API State Comparison & Hit Re-testing: Memanfaatkan Postman untuk menguji ulang endpoint API, memvalidasi parameter input, dan membandingkan struktur respons antara model yang berhasil di-hit dengan skenario kegagalan sistem.

Instalasi & Cara Menjalankan

1. Clone repositori ini:bash
git clone https://github.com/Ibms17/cofee-shop.git
cd cofee-shop
2. Install dependensi Node.js:bash
npm install
3. Konfigurasi Environment Variables:
Buat berkas .env pada direktori utama proyek, lalu masukkan kredensial PostgreSQL Anda:text
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
4. Jalankan Migrasi Database & Seeding Data Awal:bash
npx prisma migrate dev --name init
npx prisma db seed
5. Jalankan Aplikasi pada Mode Development:bash
npm run dev
