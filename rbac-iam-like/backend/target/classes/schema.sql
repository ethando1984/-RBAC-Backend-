CREATE TABLE "users" (
    user_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE roles (
    role_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE permissions (
    permission_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    permission_key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    policy_document TEXT
);
CREATE TABLE namespaces (
    namespace_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    namespace_key VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
CREATE TABLE action_types (
    action_type_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    action_key VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
-- Map permissions to namespaces and action types
CREATE TABLE resource_access (
    mapping_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    permission_id UUID REFERENCES permissions(permission_id) ON DELETE CASCADE,
    namespace_id UUID REFERENCES namespaces(namespace_id) ON DELETE CASCADE,
    action_type_id UUID REFERENCES action_types(action_type_id) ON DELETE CASCADE
);
CREATE TABLE user_roles (
    user_id UUID REFERENCES "users"(user_id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(permission_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);
CREATE TABLE orders (
    order_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    category VARCHAR(50)
);
