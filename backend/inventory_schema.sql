-- ==========================================
-- 1. CATEGORIES TABLE (Create this first!)
-- ==========================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. PRODUCTS TABLE (Relies on categories)
-- ==========================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id INTEGER REFERENCES categories (id) ON DELETE SET NULL, -- Linked perfectly!
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. USERS TABLE (For Authentication & Roles)
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. INSERT SEED DATA (Test data)
-- ==========================================
-- Insert Categories
INSERT INTO categories (name, description) 
VALUES 
('Electronics', 'Gadgets, computers, and accessories'),
('Office Supplies', 'Pens, notebooks, and desk essentials');

-- Insert Products
INSERT INTO products (sku, name, price, stock_quantity, category_id) 
VALUES 
('TECH-001', 'Wireless Mouse', 25.50, 50, 1),
('TECH-002', 'Mechanical Keyboard', 85.00, 20, 1),
('OFF-001', 'Gel Pens (12-Pack)', 4.99, 100, 2);