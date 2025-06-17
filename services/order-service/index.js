const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios'); // For inter-service communication of services

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// In Kubernetes, we'll  use the service names for communication.
// The environment variables will be set in the deployment.yaml file.
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

let connection;

async function connectToDb() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Order service connected to MySQL!');
    } catch (error) {
        console.error('Failed to connect to DB, retrying in 5 seconds...', error);
        setTimeout(connectToDb, 5000);
    }
}

// Endpoint to create an order
app.post('/orders', async (req, res) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
        return res.status(400).send('Missing userId, productId, or quantity.');
    }

    try {
        // 1. Validate user exists by calling the User Service
        await axios.get(`${USER_SERVICE_URL}/users/${userId}`);

        // 2. Get product details (like price) from the Product Service
        const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/products/${productId}`);
        const product = productResponse.data;

        if (product.stock < quantity) {
            return res.status(400).send('Not enough stock!');
        }
        
        const totalPrice = product.price * quantity;

        // 3. Save the order to the database
        const [result] = await connection.execute(
            'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)',
            [userId, productId, quantity, totalPrice]
        );
        
        // (Optional) Here you could also make a call to the product service to update the stock.
        
        res.status(201).json({ orderId: result.insertId, message: 'Order created successfully!' });

    } catch (error) {
        console.error("Error creating order:", error.message);
        if (error.response && error.response.status === 404) {
            return res.status(400).send('Invalid user or product ID.');
        }
        res.status(500).send('Error creating order.');
    }
});

const port = 3003;
app.listen(port, () => {
    connectToDb();
    console.log(`Order service listening on port ${port}`);
});

