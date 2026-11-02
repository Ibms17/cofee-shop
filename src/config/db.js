require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Membuat satu kolam koneksi tunggal untuk seluruh backend
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Ekspor objek 'prisma' tunggal ini agar bisa dipakai bersama
module.exports = prisma;