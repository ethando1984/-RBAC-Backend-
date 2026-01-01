package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.ResourceAccessMapper;
import com.aitech.rbac.model.ResourceAccess;
import com.aitech.rbac.service.ResourceAccessService;
import org.springframework.stereotype.Service;

@Service
public class ResourceAccessServiceImpl implements ResourceAccessService {
    private final ResourceAccessMapper mapper;

    public ResourceAccessServiceImpl(ResourceAccessMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void create(ResourceAccess entity) {
        if (entity.getMappingId() == null) {
            entity.setMappingId(java.util.UUID.randomUUID());
        }
        mapper.insert(entity);
    }

    @Override
    public void delete(ResourceAccess entity) {
        mapper.delete(entity);
    }

    @Override
    public java.util.List<ResourceAccess> getByPermissionId(java.util.UUID permissionId) {
        return mapper.findByPermissionId(permissionId);
    }
}
