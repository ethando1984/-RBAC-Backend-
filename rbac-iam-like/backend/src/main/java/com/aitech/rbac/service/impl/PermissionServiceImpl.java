package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.PermissionMapper;
import com.aitech.rbac.model.Permission;
import com.aitech.rbac.service.PermissionService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class PermissionServiceImpl implements PermissionService {
    private final PermissionMapper mapper;

    public PermissionServiceImpl(PermissionMapper mapper) {
        this.mapper = mapper;
    }

    public List<Permission> getAll() {
        return mapper.findAll();
    }

    public Permission getById(UUID id) {
        return mapper.findById(id);
    }

    public void create(Permission entity) {
        if (entity.getPermissionId() == null) {
            entity.setPermissionId(UUID.randomUUID());
        }
        mapper.insert(entity);
    }

    public void update(Permission entity) {
        mapper.update(entity);
    }

    public void delete(UUID id) {
        mapper.delete(id);
    }
}
