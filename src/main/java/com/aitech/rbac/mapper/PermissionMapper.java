package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Permission;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface PermissionMapper {
    @Select("SELECT * FROM permissions")
    List<Permission> findAll();

    @Select("SELECT * FROM permissions WHERE permission_id = #{id}")
    Permission findById(UUID id);

    @Insert("INSERT INTO permissions(permission_id, permission_name, description) " +
            "VALUES(#{permissionId}, #{permissionName}, #{description})")
    void insert(Permission permission);

    @Update("UPDATE permissions SET permission_name=#{permissionName}, description=#{description} WHERE permission_id=#{permissionId}")
    void update(Permission permission);

    @Delete("DELETE FROM permissions WHERE permission_id=#{id}")
    void delete(UUID id);
}
