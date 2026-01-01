package com.aitech.rbac.mapper;

import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Mapper
public interface PolicyMapper {
        @Select("<script>" +
                        "SELECT p.*, " +
                        "(SELECT COUNT(*) FROM role_permissions rp WHERE rp.permission_id = p.permission_id) as attached_role_count, "
                        +
                        "(SELECT COUNT(*) FROM namespaces n WHERE p.permission_key LIKE CONCAT(n.namespace_key, '%') ) as resource_access_count "
                        + // Approximated
                        "FROM permissions p " +
                        "WHERE 1=1 " +
                        "<if test='search != null'> AND (LOWER(p.permission_name) LIKE LOWER(CONCAT('%', #{search}, '%')) OR LOWER(p.permission_key) LIKE LOWER(CONCAT('%', #{search}, '%'))) </if>"
                        +
                        "<if test='domain != null'> AND p.permission_key LIKE CONCAT(#{domain}, '%') </if>" +
                        "<if test='usage == \"BOUND\"'> AND EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.permission_id = p.permission_id) </if>"
                        +
                        "<if test='usage == \"UNBOUND\"'> AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.permission_id = p.permission_id) </if>"
                        +
                        "ORDER BY p.permission_name ASC" +
                        "</script>")
        @Results({
                        @Result(property = "permissionId", column = "permission_id"),
                        @Result(property = "permissionName", column = "permission_name"),
                        @Result(property = "permissionKey", column = "permission_key"),
                        @Result(property = "description", column = "description"),
                        @Result(property = "resourceAccessCount", column = "resource_access_count"),
                        @Result(property = "attachedRoleCount", column = "attached_role_count")
        })
        List<com.aitech.rbac.model.Permission> searchPolicies(@Param("usage") String usage,
                        @Param("domain") String domain,
                        @Param("search") String search);

        @Select("SELECT COUNT(DISTINCT r.role_id) FROM role_permissions rp " +
                        "JOIN roles r ON rp.role_id = r.role_id " +
                        "WHERE rp.permission_id = #{permissionId}")
        Integer countBoundRoles(UUID permissionId);

        @Select("SELECT COUNT(DISTINCT ur.user_id) FROM user_roles ur " +
                        "JOIN role_permissions rp ON ur.role_id = rp.role_id " +
                        "WHERE rp.permission_id = #{permissionId}")
        Integer countAffectedUsers(UUID permissionId);

        // Helper to get permission name
        @Select("SELECT permission_name FROM permissions WHERE permission_id = #{permissionId}")
        String getPermissionName(UUID permissionId);
}
