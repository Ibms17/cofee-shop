const prisma = require('../config/db.js');
const AppError = require('../utils/error.js');

const generateInvoiceNo = async (tx, outletId) => {
    const tgl = new Date();
    const tahun = tgl.getFullYear();
    const bulan = String(tgl.getMonth() + 1).padStart(2, '0');
    const hari = String(tgl.getDate()).padStart(2, '0');
    const prefixTanggal = `${tahun}${bulan}${hari}`;

    const prefixInvoice = `INV-OUT${outletId}-${prefixTanggal}-`;

    const lastOrder = await tx.order.findFirst({
        where: {
            outletId: outletId,
            invoiceNo: { startsWith: prefixInvoice }
        },
        orderBy: { invoiceNo: 'desc' }
    });

    let nextSequence = 1;
    if (lastOrder) {
        const lastSequenceStr = lastOrder.invoiceNo.replace(prefixInvoice, '');
        const lastSequenceInt = parseInt(lastSequenceStr, 10);
        if (!isNaN(lastSequenceInt)) {
            nextSequence = lastSequenceInt + 1;
        }
    }

    const paddedSequence = String(nextSequence).padStart(4, '0');
    return `${prefixInvoice}${paddedSequence}`;
};

const createOrder = async (user, data) => {
    if (user.role !== 'KASIR' || !user.outletId) {
        throw new AppError("Akses ditolak. Hanya KASIR aktif yang dapat membuat pesanan", 403);
    }

    const { orderItems, customerName, orderType } = data;

    return await prisma.$transaction(async (tx) => {

        const products = await tx.product.findMany({
            where: {
                id: {
                    in: orderItems.map(item => Number(item.productId))
                },
                outletId: user.outletId
            }
        });

        const uniqueProductIdsInput = new Set(orderItems.map(item => Number(item.productId))).size;
        if (products.length !== uniqueProductIdsInput) {
            throw new AppError("Produk tidak valid atau tidak ditemukan di gerai Anda", 403);
        }

        const formattedOrderItems = orderItems.map(item => {
            const product = products.find(p => p.id === Number(item.productId));

            if (!product) {
                throw new AppError(`Produk dengan ID ${item.productId} tidak ditemukan`, 404);
            }

            return {
                productId: product.id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                subtotal: product.price * item.quantity
            };
        });

        const totalAmount = formattedOrderItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

        const invoiceNo = await generateInvoiceNo(tx, user.outletId);

        // 1. Simpan ke Database + Ambil Informasi Relasi Nama Kasir & Nama Outlet
        const savedOrder = await tx.order.create({
            data: {
                outletId: user.outletId,
                userId: user.id,
                invoiceNo,
                totalAmount,
                customerName: customerName || 'Guest',
                source: orderType || 'DINE_IN',
                status: "PENDING",
                orderItems: {
                    create: formattedOrderItems.map(({ name, ...rest }) => rest)
                }
            },
            // Otomatis JOIN ke tabel User dan Outlet menggunakan Eager Loading Prisma
            include: {
                kasir: {
                    select: {
                        name: true // Sesuaikan dengan nama field di tabel User Anda (name atau nama)
                    }
                },
                outlet: {
                    select: {
                        name: true // Sesuaikan dengan nama field di tabel Outlet Anda (name atau nama)
                    }
                }
            }
        });

        // 2. FORMAT DATA RESPON (Hanya menyajikan data yang Anda butuhkan untuk struk)
        return {
            namaOutlet: savedOrder.outlet?.name || "Gerai Utama",
            invoiceNo: savedOrder.invoiceNo,
            createdAt: savedOrder.createdAt,
            namaKasir: savedOrder.kasir?.name || user.name || "Kasir",
            items: formattedOrderItems.map(item => ({
                namaProduk: item.name,
                qty: item.quantity,
                harga: item.price,
                subtotal: item.subtotal
            })),
            totalHarga: savedOrder.totalAmount
        };
    });
};

module.exports = { createOrder };