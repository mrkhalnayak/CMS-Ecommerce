const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database configuration loaded from environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

let connection;

// Function to connect to the database with retries
async function connectToDb() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('User service connected to MySQL!');
    } catch (error) {
        console.error('Failed to connect to DB, retrying in 5 seconds...', error);
        setTimeout(connectToDb, 5000);
    }
}

app.get('/users', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).send('Error querying database');
    }
});

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

const port = 3001;
app.listen(port, () => {
    connectToDb();
    console.log(`User service listening on port ${port}`);
});

echo "#! Initial deployment trigger" >> services/order-service/index.js