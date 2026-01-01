package com.aitech.rbac.service;

import com.aitech.rbac.dto.UserAccessDTO;

import java.util.List;
import java.util.UUID;

public interface UserAccessService {
    List<UserAccessDTO> getUserAccess(UUID userId);
}
