-- This script creates the database and all necessary tables for the Micro-Shop application.
-- It also includes some initial seed data for testing.

-- Step 1: Create the database if it doesn't already exist.
CREATE DATABASE IF NOT EXISTS micro_shop_db;

-- Step 2: Switch to the newly created database.
USE micro_shop_db;

-- Step 3: Create the tables.

-- Table for User Service
-- Stores information about registered users.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Product Service
-- Stores the product catalog.
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL
);

-- Table for Order Service
-- Stores orders placed by users. It references the users and products tables.
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Step 4: Insert some sample data for development and testing.

-- Create a sample user
INSERT INTO users (id, username, email) VALUES (1, 'john_doe', 'john.doe@example.com')
ON DUPLICATE KEY UPDATE username='john_doe'; -- Prevents error if you run the script multiple times

-- Create sample products
INSERT INTO products (id, name, description, price, stock) VALUES (1, 'Laptop', 'A powerful development laptop', 1200.00, 50)
ON DUPLICATE KEY UPDATE name='Laptop';

INSERT INTO products (id, name, description, price, stock) VALUES (2, 'Keyboard', 'A mechanical keyboard', 95.50, 150)
ON DUPLICATE KEY UPDATE name='Keyboard';