package com.aitech.rbac.mapper;

import com.aitech.rbac.dto.UserAccessFlatDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface UserAccessMapper {
    List<UserAccessFlatDTO> getUserAccess(UUID userId);
}
