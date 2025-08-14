package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Role;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface RoleMapper {
    @Select("SELECT * FROM roles")
    List<Role> findAll();

    @Select("SELECT * FROM roles WHERE role_id = #{id}")
    Role findById(UUID id);

    @Insert("INSERT INTO roles(role_id, role_name, description, is_system_role) " +
            "VALUES(#{roleId}, #{roleName}, #{description}, #{isSystemRole})")
    void insert(Role role);

    @Update("UPDATE roles SET role_name=#{roleName}, description=#{description}, is_system_role=#{isSystemRole} WHERE role_id=#{roleId}")
    void update(Role role);

    @Delete("DELETE FROM roles WHERE role_id=#{id}")
    void delete(UUID id);
}
