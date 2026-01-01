package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.RolePermissionMapper;
import com.aitech.rbac.model.RolePermission;
import com.aitech.rbac.service.RolePermissionService;
import org.springframework.stereotype.Service;

@Service
public class RolePermissionServiceImpl implements RolePermissionService {

    private final RolePermissionMapper mapper;

    public RolePermissionServiceImpl(RolePermissionMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void create(RolePermission entity) {
        mapper.insert(entity);
    }

    @Override
    public void delete(RolePermission entity) {
        mapper.delete(entity);
    }

    @Override
    public java.util.List<RolePermission> getByRoleId(java.util.UUID roleId) {
        return mapper.findByRoleId(roleId);
    }
}
