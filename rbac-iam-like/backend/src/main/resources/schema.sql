CREATE TABLE "users" (
    user_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    preferences_json TEXT, -- Store UI preferences, locales, etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE roles (
    role_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_key VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE permissions (
    permission_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    permission_key VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    policy_document TEXT, -- Legacy/Quick Access
    lifecycle_status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE policy_versions (
    version_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    permission_id UUID REFERENCES permissions(permission_id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    document_json TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);
CREATE TABLE audit_logs (
    log_id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    actor_user_id UUID, -- nullable in case of system action or user deletion
    actor_email VARCHAR(100),
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    old_value_json TEXT,
    new_value_json TEXT,
    affected_roles_count INT DEFAULT 0,
    affected_users_count INT DEFAULT 0,
    affected_users_count INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    correlation_id VARCHAR(255)
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
-- Map permissions to namespaces and action types (The Matrix)
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
