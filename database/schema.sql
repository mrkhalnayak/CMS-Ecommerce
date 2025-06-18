-- Create the database (use the name you configured in your RDS instance)
CREATE DATABASE IF NOT EXISTS database_1;
USE database_1;

-- Users Table with Authentication Support
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Products Table with Enhanced Fields
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- Orders Table with Status Tracking
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Initial Admin User (password: Admin@123)
INSERT INTO users (username, email, password_hash, address) VALUES 
('admin', 'admin@microshop.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123 Admin Street, Admin City')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Sample Products
INSERT INTO products (name, description, price, stock, image_url, category) VALUES
('Premium Laptop', '16GB RAM, 1TB SSD, Intel i7 Processor', 1299.99, 50, '/images/laptop.jpg', 'Electronics'),
('Mechanical Keyboard', 'RGB Backlit, Cherry MX Switches', 149.50, 100, '/images/keyboard.jpg', 'Accessories'),
('Wireless Mouse', 'Ergonomic Design, 2400 DPI', 59.99, 200, '/images/mouse.jpg', 'Accessories'),
('4K Monitor', '27-inch, HDR, 144Hz Refresh Rate', 499.99, 30, '/images/monitor.jpg', 'Electronics')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;