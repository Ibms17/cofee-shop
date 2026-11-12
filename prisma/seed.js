const prisma = require('../src/config/db.js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
    const ownerEmail = process.env.SEED_OWNER_EMAIL;
    const rawPassword = process.env.SEED_OWNER_PASSWORD;

    const passwordOwner = await bcrypt.hash(rawPassword, 10);

    await prisma.user.upsert({
        where: { email: ownerEmail },
        update: {},
        create: {
            name: 'Ida Bagus Made Swarbawa',
            email: ownerEmail,
            password: passwordOwner,
            role: 'OWNER',
            status: 'APPROVED',
            outletId: null // 👑 SEKARANG BISA SET NULL! Owner bebas mengawasi dari atas
        }
    });

    console.log('✅ Sukses! Akun Owner tunggal yang berdiri di atas seluruh outlet berhasil ditanam.');


    await prisma.brand.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Kopisop'
        }
    });
    console.log('✅ Brand berhasil ditanam');
}
main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});