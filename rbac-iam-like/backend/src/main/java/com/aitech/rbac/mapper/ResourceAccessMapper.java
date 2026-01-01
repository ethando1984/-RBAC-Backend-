package com.aitech.rbac.mapper;

import com.aitech.rbac.model.ResourceAccess;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ResourceAccessMapper {
    void insert(ResourceAccess resourceAccess);

    void delete(ResourceAccess resourceAccess);

    List<ResourceAccess> findByPermissionId(UUID permissionId);

    List<ResourceAccess> findAll();
}
