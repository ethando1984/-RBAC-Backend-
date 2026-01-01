package com.aitech.rbac.service;

import com.aitech.rbac.model.ResourceAccess;

/**
 * Service for linking permissions to namespaces and action types.
 * Only create and delete operations are supported due to composite key.
 */
public interface ResourceAccessService {
    /**
     * Create a resource access mapping.
     */
    void create(ResourceAccess entity);

    void delete(ResourceAccess entity);

    java.util.List<ResourceAccess> getByPermissionId(java.util.UUID permissionId);

    java.util.List<ResourceAccess> getAll();
}
