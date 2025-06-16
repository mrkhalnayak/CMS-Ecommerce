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
    database: process.env.DB_NAME
};

let connection;

async function connectToDb() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Product service connected to MySQL!');
    } catch (error) {
        console.error('Failed to connect to DB, retrying in 5 seconds...', error);
        setTimeout(connectToDb, 5000);
    }
}

app.get('/products', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        res.status(500).send('Error querying database');
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        res.status(500).send('Error querying database');
    }
});

const port = 3002;
app.listen(port, () => {
    connectToDb();
    console.log(`Product service listening on port ${port}`);
});

