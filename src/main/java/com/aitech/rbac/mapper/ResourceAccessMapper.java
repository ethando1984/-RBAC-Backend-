package com.aitech.rbac.mapper;

import com.aitech.rbac.model.ResourceAccess;
import org.apache.ibatis.annotations.*;

@Mapper
public interface ResourceAccessMapper {
    @Insert("INSERT INTO resource_access(permission_id, namespace_id, action_type_id) VALUES(#{permissionId}, #{namespaceId}, #{actionTypeId})")
    void insert(ResourceAccess resourceAccess);

    @Delete("DELETE FROM resource_access WHERE permission_id=#{permissionId} AND namespace_id=#{namespaceId} AND action_type_id=#{actionTypeId}")
    void delete(ResourceAccess resourceAccess);
}
