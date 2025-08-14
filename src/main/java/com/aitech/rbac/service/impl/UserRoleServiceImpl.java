package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.UserRoleMapper;
import com.aitech.rbac.model.UserRole;
import com.aitech.rbac.service.UserRoleService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserRoleServiceImpl implements UserRoleService {
    private final UserRoleMapper mapper;
    public UserRoleServiceImpl(UserRoleMapper mapper) { this.mapper = mapper; }

    public List<UserRole> getAll() { return mapper.findAll(); }
    public UserRole getById(UUID id) { return mapper.findById(id); }
    public void create(UserRole entity) { mapper.insert(entity); }
    public void update(UserRole entity) { mapper.update(entity); }
    public void delete(UUID id) { mapper.delete(id); }
}
