const express = require('express');
const authRoutes = require('./routes/auth.js');
const userRoutes = require('./routes/user.js');
const outletRoutes = require('./routes/outlet.js');
const categoryRoutes = require('./routes/category.js');
const menuRoutes = require('./routes/menu.js');
const orderRoutes = require('./routes/order.js');
const paymentRoutes = require('./routes/payment.js');
const { error } = require('./middlewares/error.js');

const app = express();
app.use(express.json());

// Daftarkan jalur URL utama Akademik Kampus
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use(error);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server cafe berjalan di http://localhost:${PORT}`);
});