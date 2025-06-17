const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database configuration (unchanged)
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

let connection;

// Database connection (unchanged)
async function connectToDb() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('User service connected to MySQL!');
    } catch (error) {
        console.error('Failed to connect to DB, retrying in 5 seconds...', error);
        setTimeout(connectToDb, 5000);
    }
}

// Create router
const apiRouter = express.Router();

// Mount router at /api/users to match ingress
app.use('/api/users', apiRouter);

// Routes now only need to handle the specific endpoints
// since /api/users is already handled by the router mounting

// GET /api/users/ (matches ingress path)
apiRouter.get('/', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).send('Error querying database');
    }
});

// GET /api/users/:id (matches ingress path + ID)
apiRouter.get('/:id', async (req, res) => {
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

// Server startup!
const port = 3001;
app.listen(port, () => {
    connectToDb();
    console.log(`User service listening on port ${port}`);
});