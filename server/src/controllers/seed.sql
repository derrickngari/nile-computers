CREATE DATABASE IF NOT EXISTS nile_ops;

USE nile_ops;

CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO roles 
(name, description) VALUES
('Admin', 'System Administrator'),
('Sales', 'Sales Person'),
('Dispatch1_Picking', 'Shop Picker'),
('Dispatch2_Packaging', 'Packaging Worker'),
('Dispatch2_Manager', 'Packaging Manager'),
('Logistics', 'Logistics Coordinator'),
('Driver', 'Driver / Rider'),
('Procurement', 'Procurement Officer'),
('Customer', 'End Customer');

CREATE TABLE branches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE,
    phone VARCHAR(30),
    email VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT NOT NULL,
    registration_number VARCHAR(50) UNIQUE,
    vehicle_type ENUM('bike', 'trolley', 'van', 'truck', 'other') NOT NULL,
    model VARCHAR(100),
    current_mileage INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT,
    role_id BIGINT NOT NULL,
    assigned_vehicle_id BIGINT,
    employee_number VARCHAR(50) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(30),
    password_hash TEXT,
    photo_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE auth_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users (id),
    INDEX idx_token (token)
  );

CREATE TABLE customers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_code VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    company_name VARCHAR(255),
    phone VARCHAR(30),
    email VARCHAR(150),
    trusted_customer BOOLEAN DEFAULT FALSE,
    credit_limit DECIMAL(12,2) DEFAULT 0,
    current_credit DECIMAL(12,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE brands (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- MikroTik
-- Ubiquiti
-- TP-Link
-- Tenda
-- Cambium
-- Huawei
-- Dinstar

CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Routers
-- Switches
-- Access Points
-- OLT
-- Fiber
-- VoIP
-- Accessories

CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    brand_id BIGINT,
    category_id BIGINT,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    name VARCHAR(255),
    description TEXT,
    buying_price DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (brand_id) REFERENCES brands(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT,
    product_id BIGINT,
    quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    minimum_stock INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE(branch_id, product_id),

    FOREIGN KEY(branch_id) REFERENCES branches(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    branch_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    sales_user_id BIGINT NOT NULL,
    payment_type ENUM('cash', 'credit', 'mpesa', 'bank') NOT NULL,
    payment_status ENUM('pending', 'paid', 'partial', 'failed') DEFAULT 'pending',
    status ENUM(
        'draft',
        'pending_payment',
        'confirmed',
        'picking',
        'picked',
        'packaging',
        'packaging_review',
        'ready_for_logistics',
        'assigned_to_logistics',
        'in_transit',
        'at_parcel_company',
        'delivered',
        'cancelled',
        'returned'
    ) DEFAULT 'draft',
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (sales_user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    product_id BIGINT,
    quantity INT,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE picking_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    assigned_to BIGINT,
    started_at DATETIME,
    completed_at DATETIME,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE packaging_tasks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    worker_id BIGINT,
    manager_id BIGINT,
    started_at DATETIME,
    completed_at DATETIME,
    status ENUM('pending', 'packaging', 'review', 'approved') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE deliveries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    driver_id BIGINT,
    vehicle_id BIGINT,
    parcel_company_id BIGINT,
    assigned_by BIGINT,
    assigned_at DATETIME,
    picked_up_at DATETIME,
    handed_to_parcel_at DATETIME,
    delivered_at DATETIME,
    status ENUM('assigned', 'picked_up', 'in_transit', 'handed_to_parcel', 'delivered', 'failed', 'returned') DEFAULT 'assigned',
    delivery_notes TEXT,
    tracking_code VARCHAR(100),

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (driver_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE TABLE parcel_companies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150),
    phone VARCHAR(30),
    email VARCHAR(150),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Easy Coach
-- Modern Coast
-- ENA Coach
-- Wells Fargo Courier
-- G4S

CREATE TABLE whatsapp_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,
    phone VARCHAR(30),
    direction ENUM(
        'in',
        'out'
    ) NOT NULL,
    message TEXT,
    status ENUM(
        'sent',
        'delivered',
        'read',
        'failed'
    ) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    title VARCHAR(255),
    message TEXT,
    receiver ENUM('admin', 'user') DEFAULT 'user',
    type ENUM('order', 'inventory', 'system') DEFAULT 'order',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE activity_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    order_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE process_tracking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    process_name VARCHAR(100),
    user_id BIGINT,
    started_at DATETIME,
    ended_at DATETIME,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    old_status VARCHAR(100),
    new_status VARCHAR(100),
    changed_by BIGINT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(changed_by) REFERENCES users(id)
);

CREATE TABLE credit_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    customer_id BIGINT,
    requested_amount DECIMAL(12,2),
    approved_by BIGINT,
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    remarks TEXT,
    approved_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    FOREIGN KEY(approved_by) REFERENCES users(id)
);

CREATE TABLE suppliers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(150),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE purchase_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(100),
    supplier_id BIGINT,
    created_by BIGINT,
    status ENUM(
        'draft',
        'approved',
        'ordered',
        'received',
        'cancelled'
    ) DEFAULT 'draft',
    total_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE inventory_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT,
    branch_id BIGINT,
    transaction_type ENUM(
        'purchase',
        'sale',
        'transfer_in',
        'transfer_out',
        'adjustment',
        'return'
    ) NOT NULL,
    quantity INT,
    reference_id BIGINT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(branch_id) REFERENCES branches(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
);

CREATE TABLE stock_transfers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transfer_number VARCHAR(100),
    from_branch_id BIGINT,
    to_branch_id BIGINT,
    requested_by BIGINT,
    approved_by BIGINT,
    status ENUM(
        'requested',
        'approved',
        'in_transit',
        'received'
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(from_branch_id) REFERENCES branches(id),
    FOREIGN KEY(to_branch_id) REFERENCES branches(id),
    FOREIGN KEY(requested_by) REFERENCES users(id),
    FOREIGN KEY(approved_by) REFERENCES users(id)
);

ALTER TABLE deliveries
ADD COLUMN current_location VARCHAR(255),
ADD COLUMN proof_of_delivery TEXT,
ADD COLUMN receiver_name VARCHAR(255),
ADD COLUMN receiver_phone VARCHAR(50),
ADD COLUMN parcel_tracking_number VARCHAR(100);

CREATE TABLE order_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    uploaded_by BIGINT,
    file_url TEXT,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(uploaded_by) REFERENCES users(id)
);

CREATE TABLE sla_targets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    process_name VARCHAR(100),
    target_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_name ON roles(name);

CREATE INDEX idx_branches_code ON branches(code);
CREATE INDEX idx_branches_city ON branches(city);
CREATE INDEX idx_branches_active ON branches(active);

CREATE INDEX idx_vehicles_branch_id ON vehicles(branch_id);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_active ON vehicles(active);

CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_assigned_vehicle ON users(assigned_vehicle_id);
CREATE INDEX idx_users_employee_number ON users(employee_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_last_login ON users(last_login);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);

CREATE INDEX idx_customers_code ON customers(customer_code);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_trusted ON customers(trusted_customer);
CREATE INDEX idx_customers_active ON customers(active);

CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_active ON products(active);

CREATE INDEX idx_inventory_branch_id ON inventory(branch_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity, minimum_stock);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_branch_id ON orders(branch_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_sales_user_id ON orders(sales_user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_payment_type ON orders(payment_type);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_branch_status ON orders(branch_id, status);
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_picking_tasks_order_id ON picking_tasks(order_id);
CREATE INDEX idx_picking_tasks_assigned_to ON picking_tasks(assigned_to);
CREATE INDEX idx_picking_tasks_status ON picking_tasks(status);

CREATE INDEX idx_packaging_tasks_order_id ON packaging_tasks(order_id);
CREATE INDEX idx_packaging_tasks_worker_id ON packaging_tasks(worker_id);
CREATE INDEX idx_packaging_tasks_manager_id ON packaging_tasks(manager_id);
CREATE INDEX idx_packaging_tasks_status ON packaging_tasks(status);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_vehicle_id ON deliveries(vehicle_id);
CREATE INDEX idx_deliveries_parcel_company_id ON deliveries(parcel_company_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_assigned_by ON deliveries(assigned_by);

CREATE INDEX idx_parcel_companies_active ON parcel_companies(active);

CREATE INDEX idx_whatsapp_messages_customer_id ON whatsapp_messages(customer_id);
CREATE INDEX idx_whatsapp_messages_phone ON whatsapp_messages(phone);
CREATE INDEX idx_whatsapp_messages_direction ON whatsapp_messages(direction);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_order_id ON activity_logs(order_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

CREATE INDEX idx_process_tracking_order_id ON process_tracking(order_id);
CREATE INDEX idx_process_tracking_process_name ON process_tracking(process_name);
CREATE INDEX idx_process_tracking_user_id ON process_tracking(user_id);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_by ON order_status_history(changed_by);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at);

CREATE INDEX idx_credit_requests_order_id ON credit_requests(order_id);
CREATE INDEX idx_credit_requests_customer_id ON credit_requests(customer_id);
CREATE INDEX idx_credit_requests_approved_by ON credit_requests(approved_by);
CREATE INDEX idx_credit_requests_status ON credit_requests(approval_status);

CREATE INDEX idx_suppliers_phone ON suppliers(phone);
CREATE INDEX idx_suppliers_email ON suppliers(email);

CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_created_by ON purchase_orders(created_by);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);

CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_branch_id ON inventory_transactions(branch_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_created_by ON inventory_transactions(created_by);

CREATE INDEX idx_stock_transfers_from_branch ON stock_transfers(from_branch_id);
CREATE INDEX idx_stock_transfers_to_branch ON stock_transfers(to_branch_id);
CREATE INDEX idx_stock_transfers_requested_by ON stock_transfers(requested_by);
CREATE INDEX idx_stock_transfers_approved_by ON stock_transfers(approved_by);
CREATE INDEX idx_stock_transfers_status ON stock_transfers(status);

CREATE INDEX idx_order_attachments_order_id ON order_attachments(order_id);
CREATE INDEX idx_order_attachments_uploaded_by ON order_attachments(uploaded_by);

CREATE INDEX idx_sla_targets_process_name ON sla_targets(process_name);

ALTER TABLE users
ADD COLUMN vehicle_id BIGINT,
ADD FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);