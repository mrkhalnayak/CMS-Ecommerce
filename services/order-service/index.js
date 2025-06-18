const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false }
};

const pool = mysql.createPool(dbConfig);
const JWT_SECRET = process.env.JWT_SECRET || 'your-strong-secret';
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://user-service';
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || 'http://product-service';

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Place Order
app.post('/api/orders', authenticate, async (req, res) => {
    const { productId, quantity, shippingAddress } = req.body;
    const userId = req.user.userId;

    try {
        // Verify product exists and has stock
        const productRes = await axios.get(`${PRODUCT_SERVICE}/api/products/${productId}`);
        if (productRes.data.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // Calculate total
        const total = productRes.data.price * quantity;

        // Create order
        const [result] = await pool.execute(
            `INSERT INTO orders 
            (user_id, product_id, quantity, total_price, status, shipping_address) 
            VALUES (?, ?, ?, ?, 'pending', ?)`,
            [userId, productId, quantity, total, shippingAddress]
        );

        // Update product stock
        await axios.patch(`${PRODUCT_SERVICE}/api/products/${productId}/stock`, {
            change: -quantity
        });

        res.status(201).json({
            orderId: result.insertId,
            total,
            message: 'Order placed successfully'
        });

    } catch (error) {
        res.status(500).json({ 
            error: error.response?.data?.error || error.message 
        });
    }
});

// Get User Orders
app.get('/api/orders', authenticate, async (req, res) => {
    try {
        const [orders] = await pool.execute(`
            SELECT o.*, p.name as product_name, p.price as unit_price 
            FROM orders o
            JOIN products p ON o.product_id = p.id
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [req.user.userId]);
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`Order service listening on port ${port}`);
});