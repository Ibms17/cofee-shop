const prisma = require('../src/config/db.js');
const bcrypt = require('bcryptjs');

async function main() {
    const passwordOwner = await bcrypt.hash('ibms220898', 10);

    await prisma.user.upsert({
        where: { email: 'ibmswarbawa@gmail.com' },
        update: {},
        create: {
            email: 'ibmswarbawa@gmail.com',
            name: 'Ida Bagus Made Swarbawa',
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