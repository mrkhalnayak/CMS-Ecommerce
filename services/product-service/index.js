const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

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

// Product Catalog
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, name, description, price, stock, image_url 
            FROM products
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Product Detail
app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Stock (called by order service)
app.patch('/api/products/:id/stock', async (req, res) => {
    try {
        const { change } = req.body;
        await pool.execute(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [change, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Product service listening on port ${port}`);
});