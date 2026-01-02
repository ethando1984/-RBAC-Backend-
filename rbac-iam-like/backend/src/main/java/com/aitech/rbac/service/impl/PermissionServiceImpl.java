package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.PermissionMapper;
import com.aitech.rbac.mapper.PolicyVersionMapper;
import com.aitech.rbac.model.Permission;
import com.aitech.rbac.service.PermissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class PermissionServiceImpl implements PermissionService {
    private final PermissionMapper mapper;
    private final PolicyVersionMapper policyVersionMapper;

    public PermissionServiceImpl(PermissionMapper mapper, PolicyVersionMapper policyVersionMapper) {
        this.mapper = mapper;
        this.policyVersionMapper = policyVersionMapper;
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

    @Transactional
    public void delete(UUID id) {
        policyVersionMapper.deleteByPermissionId(id);
        mapper.delete(id);
    }
}
