const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
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

// User Registration
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, email, password, address } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password_hash, address) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, address]
        );
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'User registered successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Login
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0 || !await bcrypt.compare(password, users[0].password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: users[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: users[0].id, username: users[0].username } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get/Update User Profile
app.route('/api/users/:id')
    .get(async (req, res) => {
        try {
            const [rows] = await pool.execute('SELECT id, username, email, address FROM users WHERE id = ?', [req.params.id]);
            res.json(rows[0] || {});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
    .put(async (req, res) => {
        try {
            const { username, email, address } = req.body;
            await pool.execute(
                'UPDATE users SET username = ?, email = ?, address = ? WHERE id = ?',
                [username, email, address, req.params.id]
            );
            res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`User service listening on port ${port}`);
});