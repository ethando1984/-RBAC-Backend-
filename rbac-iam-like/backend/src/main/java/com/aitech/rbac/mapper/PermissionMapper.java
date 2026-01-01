package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Permission;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface PermissionMapper {
        List<Permission> findAll();

        Permission findById(UUID id);

        void insert(Permission permission);

        void update(Permission permission);

        void delete(UUID id);
}
