package com.aitech.rbac.service;

import com.aitech.rbac.model.RolePermission;

public interface RolePermissionService {
    void create(RolePermission entity);
    void delete(RolePermission entity);
}
