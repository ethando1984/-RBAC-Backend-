package com.aitech.rbac.mapper;

import com.aitech.rbac.model.RolePermission;
import org.apache.ibatis.annotations.*;

import java.util.UUID;

@Mapper
public interface RolePermissionMapper {
    @Insert("INSERT INTO role_permissions(role_id, permission_id, assigned_at) VALUES(#{roleId}, #{permissionId}, #{assignedAt})")
    void insert(RolePermission rolePermission);

    @Delete("DELETE FROM role_permissions WHERE role_id=#{roleId} AND permission_id=#{permissionId}")
    void delete(RolePermission rolePermission);

    @Select("SELECT * FROM role_permissions WHERE role_id = #{roleId}")
    java.util.List<RolePermission> findByRoleId(UUID roleId);
}
