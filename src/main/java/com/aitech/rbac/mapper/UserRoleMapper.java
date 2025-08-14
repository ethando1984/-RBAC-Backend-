package com.aitech.rbac.mapper;

import com.aitech.rbac.model.UserRole;
import org.apache.ibatis.annotations.*;

import java.util.UUID;

@Mapper
public interface UserRoleMapper {
    @Insert("INSERT INTO user_roles(user_id, role_id) VALUES(#{userId}, #{roleId})")
    void insert(UserRole userRole);

    @Delete("DELETE FROM user_roles WHERE user_id=#{userId} AND role_id=#{roleId}")
    void delete(UserRole userRole);
}
