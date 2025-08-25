CREATE TABLE "users" (
    user_id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);
CREATE TABLE namespaces (
    namespace_id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    namespace_key VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
CREATE TABLE action_types (
    action_type_id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
    action_key VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
-- Map permissions to namespaces and action types
CREATE TABLE resource_access (
    permission_id UUID REFERENCES permissions(permission_id) ON DELETE CASCADE,
    namespace_id UUID REFERENCES namespaces(namespace_id) ON DELETE CASCADE,
    action_type_id UUID REFERENCES action_types(action_type_id) ON DELETE CASCADE,
    PRIMARY KEY (permission_id, namespace_id, action_type_id)
);
CREATE TABLE user_roles (
    user_id UUID REFERENCES "users"(user_id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
