package com.aitech.rbac.service.impl;

import com.aitech.rbac.mapper.RoleMapper;
import com.aitech.rbac.model.Role;
import com.aitech.rbac.service.RoleService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class RoleServiceImpl implements RoleService {
    private final RoleMapper mapper;
    public RoleServiceImpl(RoleMapper mapper) { this.mapper = mapper; }

    public List<Role> getAll() { return mapper.findAll(); }
    public Role getById(UUID id) { return mapper.findById(id); }
    public void create(Role entity) { mapper.insert(entity); }
    public void update(Role entity) { mapper.update(entity); }
    public void delete(UUID id) { mapper.delete(id); }
}
