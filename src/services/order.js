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
    // Pengecekan outletId (karena role kasir sudah dihandle di route middleware)
    if (!user.outletId) {
        throw new AppError("Akses ditolak. Pengguna internal wajib terikat dengan gerai/outlet", 403);
    }

    const { orderItems, customerName, orderType } = data;

    return await prisma.$transaction(async (tx) => {
        const menus = await tx.menu.findMany({
            where: {
                id: {
                    in: orderItems.map(item => Number(item.menuId))
                },
                outletId: user.outletId
            }
        });

        const uniqueMenuIdsInput = new Set(orderItems.map(item => Number(item.menuId))).size;
        if (menus.length !== uniqueMenuIdsInput) {
            throw new AppError("Produk tidak valid atau tidak ditemukan di gerai Anda", 403);
        }

        const formattedOrderItems = orderItems.map(item => {
            const menu = menus.find(p => p.id === Number(item.menuId));

            if (!menu) {
                throw new AppError(`Produk dengan ID ${item.menuId} tidak ditemukan`, 404);
            }

            return {
                menuId: menu.id,
                name: menu.name,
                quantity: item.quantity,
                price: menu.price,
                subtotal: menu.price * item.quantity,
                notes: item.notes
            };
        });

        const totalAmount = formattedOrderItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

        const invoiceNo = await generateInvoiceNo(tx, user.outletId);

        // 1. Simpan ke Database 
        // Lakukan relasi bertingkat ke brand melalu outlet
        const saveOrder = await tx.order.create({
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
            // Eager Loading: Tarik outlet, lalu tarik brand di dalamnya untuk mengambil 'name'
            include: {
                kasir: { select: { name: true } },
                outlet: {
                    include: {
                        brand: { select: { name: true } }
                    }
                }
            }
        });

        // 2. FORMAT DATA RESPON (Menggunakan nama brand, bukan nama outlet)
        return {
            orderId: saveOrder.id,
            namaBrand: saveOrder.outlet?.brand?.name || "Kopisop", // <--- Mengembalikan nama brand
            invoiceNo: saveOrder.invoiceNo,
            createdAt: saveOrder.createdAt,
            items: formattedOrderItems.map(item => ({
                namaProduk: item.name,
                qty: item.quantity,
                harga: item.price,
                subtotal: item.subtotal,
                catatan: item.notes || "-"
            })),
            totalHarga: saveOrder.totalAmount
        };
    });
};

const getAllOrders = async (user, query) => {
    const { status, page = 1, limit = 10 } = query;

    const whereFilter = {
        outletId: user.outletId
    };

    if (status) {
        whereFilter.status = status;
    }

    const parsedLimit = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * parsedLimit;

    const orders = await prisma.order.findMany({
        where: whereFilter,
        skip: skip,
        take: parsedLimit,
        orderBy: { createdAt: 'desc' },
        include: {
            orderItems: {
                include: { menu: { select: { name: true } } }
            }
        }
    });

    return orders;
};

const getOrderById = async (id, user) => {
    const order = await prisma.order.findUnique({
        where: {
            id: Number(id),
            outletId: user.outletId
        },
        include: {
            orderItems: {
                include: { menu: { select: { name: true } } }
            }
        }
    });

    if (!order) {
        throw new AppError("Order tidak ditemukan di gerai Anda", 404);
    }

    return order;
};

const updateOrderStatus = async (id, newStatus, user) => {
    const allowedStatuses = ['PENDING', 'QUEUE', 'PREPARING', 'COMPLETED', 'CANCELLED'];
    if (!allowedStatuses.includes(newStatus)) {
        throw new AppError("Status pesanan tidak valid", 400);
    }

    const order = await prisma.order.findUnique({
        where: {
            id: Number(id),
            outletId: user.outletId
        }
    });

    if (!order) {
        throw new AppError("Order tidak ditemukan di gerai Anda", 404);
    }

    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus }
    });

    return updatedOrder;
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus };