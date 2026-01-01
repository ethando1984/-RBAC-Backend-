package com.aitech.rbac.mapper;

import com.aitech.rbac.dto.UserAccessFlatDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.UUID;

@Mapper
public interface UserAccessMapper {

    @Select("SELECT " +
            "    u.user_id, " +
            "    u.username, " +
            "    r.role_id, " +
            "    r.role_name, " +
            "    p.permission_id, " +
            "    p.permission_name, " +
            "    n.namespace_key, " +
            "    a.action_key " +
            "FROM \"users\" u " +
            "JOIN user_roles ur ON u.user_id = ur.user_id " +
            "JOIN roles r ON ur.role_id = r.role_id " +
            "JOIN role_permissions rp ON r.role_id = rp.role_id " +
            "JOIN permissions p ON rp.permission_id = p.permission_id " +
            "JOIN resource_access ra ON p.permission_id = ra.permission_id " +
            "JOIN namespaces n ON ra.namespace_id = n.namespace_id " +
            "JOIN action_types a ON ra.action_type_id = a.action_type_id " +
            "WHERE u.user_id = #{userId}")
    List<UserAccessFlatDTO> getUserAccess(UUID userId);
}
