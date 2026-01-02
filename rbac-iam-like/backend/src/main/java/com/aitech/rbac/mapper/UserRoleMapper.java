package com.aitech.rbac.mapper;

import com.aitech.rbac.model.UserRole;
import org.apache.ibatis.annotations.*;

import java.util.UUID;

@Mapper
public interface UserRoleMapper {
    void insert(UserRole userRole);

    void delete(UserRole userRole);
}
