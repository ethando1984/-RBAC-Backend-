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

    /**
     * Remove an existing mapping.
     */
    void delete(ResourceAccess entity);
}
