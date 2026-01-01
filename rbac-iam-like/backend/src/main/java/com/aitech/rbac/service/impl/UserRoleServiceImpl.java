package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.UserRoleMapper;
import com.aitech.rbac.model.UserRole;
import com.aitech.rbac.service.UserRoleService;
import org.springframework.stereotype.Service;

@Service
public class UserRoleServiceImpl implements UserRoleService {
    private final UserRoleMapper mapper;

    public UserRoleServiceImpl(UserRoleMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void create(UserRole entity) {
        mapper.insert(entity);
    }

    @Override
    public void delete(UserRole entity) {
        mapper.delete(entity);
    }
}
