package com.aitech.rbac.mapper;

import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface PolicyMapper {
        List<com.aitech.rbac.model.Permission> searchPolicies(@Param("usage") String usage,
                        @Param("domain") String domain,
                        @Param("search") String search);

        Integer countBoundRoles(UUID permissionId);

        Integer countAffectedUsers(UUID permissionId);

        String getPermissionName(UUID permissionId);
}
