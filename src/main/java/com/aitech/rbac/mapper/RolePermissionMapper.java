package com.aitech.rbac.mapper;

import com.aitech.rbac.model.RolePermission;
import org.apache.ibatis.annotations.*;

import java.util.UUID;

@Mapper
public interface RolePermissionMapper {
    @Insert("INSERT INTO role_permissions(role_id, permission_id) VALUES(#{roleId}, #{permissionId})")
    void insert(RolePermission rolePermission);

    @Delete("DELETE FROM role_permissions WHERE role_id=#{roleId} AND permission_id=#{permissionId}")
    void delete(RolePermission rolePermission);
}
