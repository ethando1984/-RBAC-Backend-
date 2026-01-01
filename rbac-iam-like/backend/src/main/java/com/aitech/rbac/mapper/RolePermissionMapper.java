package com.aitech.rbac.mapper;

import com.aitech.rbac.model.RolePermission;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface RolePermissionMapper {
    void insert(RolePermission rolePermission);

    void delete(RolePermission rolePermission);

    List<RolePermission> findByRoleId(UUID roleId);

    List<RolePermission> findAll();
}
