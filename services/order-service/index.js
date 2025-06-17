const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan'); // Added for request logging

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Log HTTP requests

// Database configuration with connection pooling and SSL
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false // Required for RDS SSL
  }
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Service URLs - Kubernetes DNS names
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service';

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Order creation endpoint
app.post('/api/orders', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  // Input validation
  if (!userId || !productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid input: userId, productId, and positive quantity required' });
  }

  let connection;
  try {
    // 1. Validate user exists
    await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`, {
      timeout: 5000 // 5-second timeout
    });

    // 2. Get product details
    const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`, {
      timeout: 5000
    });
    const product = productResponse.data;

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // 3. Process order in transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const totalPrice = product.price * quantity;
    
    // Insert order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)',
      [userId, productId, quantity, totalPrice]
    );

    // Update product stock (example of inter-service call)
    await axios.patch(`${PRODUCT_SERVICE_URL}/api/products/${productId}/stock`, {
      change: -quantity
    }, { timeout: 5000 });

    await connection.commit();
    
    res.status(201).json({
      orderId: orderResult.insertId,
      totalPrice,
      message: 'Order created successfully'
    });

  } catch (error) {
    if (connection) await connection.rollback();
    
    console.error('Order creation failed:', error.message);
    
    if (error.response) {
      // Forward error from other services
      return res.status(error.response.status).json(error.response.data);
    }
    
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) connection.release();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
  // Test DB connection on startup
  pool.getConnection()
    .then(conn => {
      console.log('Database connection established');
      conn.release();
    })
    .catch(err => {
      console.error('Database connection failed:', err.message);
    });
});