import type { Registry } from './policy-types';

/**
 * Helper to convert dynamic API data (Namespaces + ActionTypes) into a Registry.
 * Based on the current application logic where every namespace supports every action type (Cross-Product).
 */
export function buildRegistryFromCrossProduct(
    namespaces: { namespaceKey: string;[key: string]: any }[],
    actionTypes: { actionKey: string;[key: string]: any }[]
): Registry {
    const registry: Registry = {};

    // Extract all available action keys
    const allActionKeys = actionTypes.map(at => at.actionKey);

    namespaces.forEach(ns => {
        // Use namespaceKey as the registry key
        const key = ns.namespaceKey;
        registry[key] = {
            key: key,
            // Generate a readable label if one isn't provided (e.g., 'users' -> 'Users')
            label: key.charAt(0).toUpperCase() + key.slice(1),
            // In the matrix view, all namespaces implicitly support all defined action types
            supportedActions: [...allActionKeys]
        };
    });

    return registry;
}

/**
 * Example Static Registry for testing or validation logic off-line.
 */
export const STATIC_REGISTRY: Registry = {
    users: {
        key: 'users',
        label: 'User Management',
        supportedActions: ['read', 'create', 'update', 'delete', 'list', 'assign_role']
    },
    roles: {
        key: 'roles',
        label: 'Role Management',
        supportedActions: ['read', 'create', 'update', 'delete', 'manage_permissions']
    },
    system: {
        key: 'system',
        label: 'System Configuration',
        supportedActions: ['read', 'update', 'audit']
    }
};
