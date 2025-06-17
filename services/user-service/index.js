const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ... (database connection logic is fine)

// This route correctly listens for '/users'
app.get('/users', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).send('Error querying database');
    }
});

// This route correctly listens for '/users/:id'
app.get('/users/:id', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send('Error querying database');
    }
});

// ... (server startup logic is fine)
const port = 3001;
app.listen(port, () => {
    // ...
});