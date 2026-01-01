package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Permission;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface PermissionMapper {
    @Select("SELECT p.*, " +
            "(SELECT COUNT(*) FROM resource_access ra WHERE ra.permission_id = p.permission_id) as resource_access_count, "
            +
            "(SELECT COUNT(*) FROM role_permissions rp WHERE rp.permission_id = p.permission_id) as attached_role_count "
            +
            "FROM permissions p")
    List<Permission> findAll();

    @Select("SELECT p.*, " +
            "(SELECT COUNT(*) FROM resource_access ra WHERE ra.permission_id = p.permission_id) as resource_access_count, "
            +
            "(SELECT COUNT(*) FROM role_permissions rp WHERE rp.permission_id = p.permission_id) as attached_role_count "
            +
            "FROM permissions p WHERE permission_id = #{id}")
    Permission findById(UUID id);

    @Insert("INSERT INTO permissions(permission_id, permission_name, permission_key, description) " +
            "VALUES(#{permissionId}, #{permissionName}, #{permissionKey}, #{description})")
    void insert(Permission permission);

    @Update("UPDATE permissions SET permission_name=#{permissionName}, permission_key=#{permissionKey}, description=#{description} WHERE permission_id=#{permissionId}")
    void update(Permission permission);

    @Delete("DELETE FROM permissions WHERE permission_id=#{id}")
    void delete(UUID id);
}
