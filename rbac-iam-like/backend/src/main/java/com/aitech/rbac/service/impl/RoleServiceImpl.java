package com.aitech.rbac.service.impl;

import com.aitech.rbac.dto.PageResponse;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.aitech.rbac.mapper.RoleMapper;
import com.aitech.rbac.model.Role;
import com.aitech.rbac.service.RoleService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class RoleServiceImpl implements RoleService {
    private final RoleMapper mapper;

    public RoleServiceImpl(RoleMapper mapper) {
        this.mapper = mapper;
    }

    public List<Role> getAll() {
        return mapper.findAll(null);
    }

    public PageResponse<Role> getAll(int page, int size, String search) {
        PageHelper.startPage(page, size);
        List<Role> roles = mapper.findAll(search);
        PageInfo<Role> pageInfo = new PageInfo<>(roles);
        return new PageResponse<>(roles, pageInfo.getTotal(), page, size);
    }

    public Role getById(UUID id) {
        return mapper.findById(id);
    }

    public List<Role> getByUserId(UUID userId) {
        return mapper.findByUserId(userId);
    }

    public void create(Role entity) {
        if (entity.getRoleId() == null) {
            entity.setRoleId(UUID.randomUUID());
        }
        mapper.insert(entity);
    }

    public void update(Role entity) {
        mapper.update(entity);
    }

    public void delete(UUID id) {
        mapper.delete(id);
    }
}
