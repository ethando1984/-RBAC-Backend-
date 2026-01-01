package com.aitech.rbac.mapper;

import com.aitech.rbac.model.Role;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.UUID;

@Mapper
public interface RoleMapper {
    List<Role> findAll(@Param("search") String search);

    Role findById(UUID id);

    List<Role> findByUserId(UUID userId);

    void insert(Role role);

    void update(Role role);

    void delete(UUID id);
}
