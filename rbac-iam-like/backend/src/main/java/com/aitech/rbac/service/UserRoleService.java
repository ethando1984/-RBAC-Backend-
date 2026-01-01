package com.aitech.rbac.service;

import com.aitech.rbac.model.UserRole;

/**
 * Service layer for managing the relationship between users and roles.
 * This association is represented by a composite key of user and role IDs,
 * so only create and delete operations are supported.
 */
public interface UserRoleService {
    /**
     * Link a role to a user.
     */
    void create(UserRole entity);

    /**
     * Remove a role from a user.
     */
    void delete(UserRole entity);
}
